import WebSocket from "ws";
import { buildSystemPrompt } from "./openai.js";
import { lodgeTools, runTool } from "../beds24/tool.js";
import { logger } from "../lib/logger.js";

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
 */
export function handleRealtimeWs(clientWs: WebSocket): void {
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

  // ── OpenAI connection lifecycle ────────────────────────────────────────────

  openaiWs.on("open", () => {
    logger.info({ model }, "Realtime relay: OpenAI WS open");

    openaiWs.send(
      JSON.stringify({
        type: "session.update",
        session: {
          voice: "alloy",
          instructions: buildSystemPrompt(),
          tools: realtimeTools,
          tool_choice: "auto",
          input_audio_format: "pcm16",
          output_audio_format: "pcm16",
          turn_detection: { type: "server_vad" },
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

    // Relay everything else to the browser
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
    if (clientWs.readyState === WebSocket.OPEN) clientWs.close();
  });

  // ── Browser connection lifecycle ───────────────────────────────────────────

  clientWs.on("message", (data) => {
    if (openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.send(data.toString());
    }
  });

  clientWs.on("close", () => {
    if (openaiWs.readyState !== WebSocket.CLOSED) openaiWs.close();
    pendingTools.clear();
  });

  clientWs.on("error", (err) => {
    logger.error({ err }, "Realtime relay: client WS error");
    if (openaiWs.readyState !== WebSocket.CLOSED) openaiWs.close();
  });
}
