import WebSocket from "ws";
import { buildSystemPrompt } from "./openai.js";
import { lodgeTools, runTool } from "../beds24/tool.js";
import { logger } from "../lib/logger.js";
import { db, withDbRetry } from "@workspace/db";
import { conversations, messages } from "@workspace/db";

const REALTIME_MODEL = () =>
  process.env.OPENAI_REALTIME_MODEL ?? "gpt-realtime-2";
const API_KEY = () => process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? "";

/**
 * Server-side WebSocket relay between a browser client and the OpenAI Realtime API.
 *
 * Flow:
 *   browser WS  ←→  this relay  ←→  wss://api.openai.com/v1/realtime
 *
 * Tool calls are executed entirely on the server so the API key never reaches
 * the browser.  All other events are relayed bi-directionally.
 *
 * Recording policy:
 *   - User audio and transcripts are NOT stored in the database.
 *   - Mia's assistant turns (role: "assistant") ARE stored after each
 *     response.done event for quality-control purposes.
 */
export function handleRealtimeWs(clientWs: WebSocket, lang = "en"): void {
  const model = REALTIME_MODEL();
  const apiKey = API_KEY();

  if (!apiKey) {
    logger.error("AI_INTEGRATIONS_OPENAI_API_KEY is not set");
    clientWs.close(1011, "Server misconfiguration");
    return;
  }

  const openaiWs = new WebSocket(
    `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  );

  // call_id → function name (populated from response.output_item.added)
  const pendingTools = new Map<string, string>();

  const realtimeTools = lodgeTools.map((t) => ({
    type: "function" as const,
    name: t.function.name,
    description: t.function.description,
    parameters: t.function.parameters,
  }));

  // ── Quality-control: save Mia's assistant turns to DB ─────────────────────
  let conversationId: number | null = null;
  // Accumulates the text delta for the current Mia response
  let miaTranscriptBuffer = "";

  async function initConversation(): Promise<void> {
    try {
      const date = new Date().toISOString().slice(0, 10);
      const [conv] = await db
        .insert(conversations)
        .values({ title: `Voice session — ${date}` })
        .returning();
      conversationId = conv.id;
      logger.info({ conversationId }, "Realtime relay: DB conversation created");
    } catch (err) {
      logger.warn({ err }, "Realtime relay: could not create DB conversation (non-fatal)");
    }
  }

  function flushMiaTranscript(): void {
    const text = miaTranscriptBuffer.trim();
    miaTranscriptBuffer = "";
    if (!conversationId || !text) return;

    const convId = conversationId; // capture for async closure
    withDbRetry(() =>
      db.insert(messages).values({ conversationId: convId, role: "assistant", content: text }),
    ).catch((err) =>
      logger.error({ err, convId }, "Realtime relay: failed to save Mia transcript"),
    );
  }

  // ── OpenAI connection lifecycle ────────────────────────────────────────────

  openaiWs.on("open", async () => {
    logger.info({ model }, "Realtime relay: OpenAI WS open");

    // Create DB record (best-effort, must not block the session setup)
    void initConversation();

    openaiWs.send(
      JSON.stringify({
        type: "session.update",
        session: {
          modalities: ["text", "audio"],
          instructions: buildSystemPrompt(),
          voice: "alloy",
          input_audio_format: "pcm16",
          output_audio_format: "pcm16",
          input_audio_transcription: { model: "whisper-1" },
          turn_detection: { type: "server_vad" },
          tools: realtimeTools,
          tool_choice: "auto",
        },
      }),
    );

    // Let the browser know the relay is up and it can start streaming audio
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ type: "session.ready" }));
    }
  });

  openaiWs.on("message", async (data) => {
    if (clientWs.readyState !== WebSocket.OPEN) return;

    let event: Record<string, unknown>;
    try {
      event = JSON.parse(data.toString()) as Record<string, unknown>;
    } catch {
      return;
    }

    const evtType = event.type as string;

    // After session is configured, inject the opening greeting and trigger it
    if (evtType === "session.updated") {
      openaiWs.send(
        JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "system",
            content: [
              {
                type: "input_text",
                text: `The guest's browser language is "${lang}". Greet them now in that language using exactly this message (translated): "Hi, I'm Mia, the DEVOCEAN online receptionist. You can ask me anything about the lodge, the accommodation options, experiences, available transfers, rates and availability. How can I help?"`,
              },
            ],
          },
        }),
      );
      openaiWs.send(JSON.stringify({ type: "response.create" }));
      return; // do not relay session.updated to browser
    }

    // Track call_id → function name so we can look it up when args are done
    if (evtType === "response.output_item.added") {
      const item = event.item as Record<string, unknown> | undefined;
      if (item?.type === "function_call") {
        pendingTools.set(item.call_id as string, item.name as string);
      }
    }

    // Execute tool server-side; never relay raw function call events to browser
    if (evtType === "response.function_call_arguments.done") {
      const callId = event.call_id as string;
      const name =
        (event.name as string | undefined) ?? pendingTools.get(callId) ?? "";
      const argsJson = (event.arguments as string | undefined) ?? "{}";
      pendingTools.delete(callId);

      if (!name) {
        logger.warn({ callId }, "Realtime relay: unknown call_id, skipping tool");
        return;
      }

      try {
        const output = await runTool(name, argsJson);
        if (openaiWs.readyState === WebSocket.OPEN) {
          openaiWs.send(
            JSON.stringify({
              type: "conversation.item.create",
              item: { type: "function_call_output", call_id: callId, output },
            }),
          );
          openaiWs.send(JSON.stringify({ type: "response.create" }));
        }
        // Optional UI hint so the widget can show "Looking up availability…"
        clientWs.send(JSON.stringify({ type: "mia.tool_called", name }));
      } catch (err) {
        logger.error({ err, name }, "Realtime relay: tool execution failed");
      }
      return; // do not relay function_call events to browser
    }

    // Accumulate Mia's spoken transcript for quality-control storage.
    // NOTE: user audio transcript events (conversation.item.input_audio_transcription.*)
    // are relayed to the browser but deliberately NOT stored in the database.
    if (evtType === "response.audio_transcript.delta" && event.delta) {
      miaTranscriptBuffer += event.delta as string;
      // fall through — still relay to browser for live UI
    }

    // Mia finished one response turn: persist the buffered transcript
    if (evtType === "response.done") {
      flushMiaTranscript();
      // fall through — still relay to browser
    }

    // Relay everything else (and the above fall-throughs) to the browser
    clientWs.send(data.toString());
  });

  openaiWs.on("error", (err) => {
    logger.error({ err }, "Realtime relay: OpenAI WS error");
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(
        JSON.stringify({
          type: "error",
          error: { message: `OpenAI connection error: ${(err as Error).message}` },
        }),
      );
      clientWs.close();
    }
  });

  openaiWs.on("close", (code, reason) => {
    logger.info({ code, reason: reason.toString() }, "Realtime relay: OpenAI WS closed");
    flushMiaTranscript(); // save any partial response if connection drops mid-sentence
    if (clientWs.readyState === WebSocket.OPEN) clientWs.close();
  });

  // ── Browser connection lifecycle ───────────────────────────────────────────

  clientWs.on("message", (data) => {
    if (openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.send(data.toString());
    }
  });

  clientWs.on("close", () => {
    flushMiaTranscript(); // save any partial on clean disconnect too
    if (openaiWs.readyState !== WebSocket.CLOSED) openaiWs.close();
    pendingTools.clear();
  });

  clientWs.on("error", (err) => {
    logger.error({ err }, "Realtime relay: client WS error");
    if (openaiWs.readyState !== WebSocket.CLOSED) openaiWs.close();
  });
}
