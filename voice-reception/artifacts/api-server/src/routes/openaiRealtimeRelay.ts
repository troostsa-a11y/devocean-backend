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
  // Guard: only fire the opening response.create on the first session.updated.
  // Subsequent session.update calls (VAD mute/unmute) also trigger session.updated
  // and must NOT fire another response.create or the session loops infinitely.
  let sessionGreetingSent = false;

  // ── VAD mute/unmute state ───────────────────────────────────────────────────
  // True from response.created until response.done — i.e. OpenAI is actively
  // generating this turn. Also used to discard falsely-detected "speech"
  // (echo/ambient noise through speakers) during the mute race window right
  // after response.created — see input_audio_buffer.speech_started handler.
  let responseInFlight = false;
  // True once the BROWSER confirms it has finished actually playing back the
  // audio for the current turn (see "client.mia_playback_done" below). This is
  // deliberately separate from response.done: response.done only means OpenAI
  // finished GENERATING the turn — for longer responses (e.g. reciting back a
  // full reservation summary) generation regularly outpaces real-time playback,
  // so several seconds of audio can still be queued/playing in the browser
  // after response.done fires. Unmuting on response.done alone re-opens the mic
  // during that playback tail; any echo/ambient noise then triggers speech_started,
  // and the client's barge-in handler (stopPlayback()) abruptly cuts Marin off
  // mid-sentence even though generation was already complete.
  let playbackDrained = true;
  let unmuteFallbackTimer: NodeJS.Timeout | null = null;

  function clearUnmuteFallbackTimer(): void {
    if (unmuteFallbackTimer) {
      clearTimeout(unmuteFallbackTimer);
      unmuteFallbackTimer = null;
    }
  }

  // Only re-enable server VAD once BOTH generation and playback have finished
  // for the current turn. If a new response starts before that happens (e.g.
  // the immediate follow-up response.create after a tool call), responseInFlight
  // flips back to true and this is a no-op until the new turn also fully drains.
  function maybeUnmuteVad(): void {
    if (responseInFlight || !playbackDrained) return;
    clearUnmuteFallbackTimer();
    if (openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.send(JSON.stringify({
        type: "session.update",
        session: { type: "realtime", audio: { input: { turn_detection: SERVER_VAD } } },
      }));
    }
  }

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

  // Shared VAD config — referenced by session.update on open AND when re-enabling after tool calls.
  //
  // interrupt_response: false is required here (not just the manual mute below).
  // OpenAI's server_vad defaults interrupt_response to true, meaning it will
  // auto-cancel an in-progress response the instant it detects speech-like audio —
  // independent of our own turn_detection:null mute. There is an unavoidable race
  // between response.created firing and our mute session.update being processed
  // by OpenAI; during that window, speaker bleed/ambient noise can trigger a false
  // VAD "speech_started" and OpenAI itself (not our relay) truncates the response
  // mid-sentence. Disabling interrupt_response at the source closes this race
  // entirely, regardless of message timing. create_response stays default (true)
  // so normal end-of-turn auto-response still works.
  const SERVER_VAD = {
    type: "server_vad" as const,
    threshold: 0.65,          // higher = less sensitive to ambient noise (default 0.5)
    silence_duration_ms: 600, // wait a bit longer before cutting off speech
    prefix_padding_ms: 300,
    interrupt_response: false,
  };

  openaiWs.on("open", async () => {
    logger.info({ model }, "Realtime relay: OpenAI WS open");

    // Create DB record (best-effort, must not block the session setup)
    void initConversation();

    const sessionUpdate = {
      type: "session.update",
      session: {
        type: "realtime",
        instructions: buildSystemPrompt(lang),
        audio: {
          input: { turn_detection: SERVER_VAD },
          output: { voice: "coral" },
        },
        tools: realtimeTools,
        tool_choice: "auto",
      },
    };
    logger.info(
      { model, voice: "coral", toolCount: realtimeTools.length },
      "Realtime relay: sending session.update",
    );
    openaiWs.send(JSON.stringify(sessionUpdate));

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

    // Debug: log every event from OpenAI (visible in Render logs)
    if (evtType === "error") {
      logger.error({ event }, "Realtime relay: OpenAI error event");
    } else if (!evtType.includes(".delta")) {
      logger.info({ evtType }, "Realtime relay: OpenAI event");
    }

    // After session is configured, trigger the opening greeting.
    // Greeting instruction lives in session-level instructions (buildSystemPrompt(lang))
    // because gpt-realtime-2 is a reasoning model that ignores per-response
    // instructions in response.create. A bare response.create is enough.
    if (evtType === "session.updated") {
      // Only send the opening greeting on the very first session.updated (initial
      // session setup). Subsequent session.updated events are fired by our own
      // VAD mute/unmute session.update calls and must not trigger another greeting.
      if (!sessionGreetingSent) {
        sessionGreetingSent = true;
        openaiWs.send(JSON.stringify({ type: "response.create" }));
      }
      return; // do not relay session.updated to browser
    }

    // ── VAD muting: disable while Marin is generating AND while she's still ──
    // playing back audio in the browser. Mute (force) on every response.created;
    // only unmute once BOTH generation is done (response.done) AND the browser
    // has confirmed local playback fully drained (client.mia_playback_done,
    // handled in the client-message listener below). See maybeUnmuteVad().
    if (evtType === "response.created") {
      responseInFlight = true;
      playbackDrained = false;
      clearUnmuteFallbackTimer();
      if (openaiWs.readyState === WebSocket.OPEN) {
        openaiWs.send(JSON.stringify({
          type: "session.update",
          session: { type: "realtime", audio: { input: { turn_detection: null } } },
        }));
      }
      // fall through — relay response.created to browser
    }

    if (evtType === "response.done") {
      responseInFlight = false;
      // Safety net: if the browser's playback-drained ack never arrives (e.g. a
      // dropped WS message), don't leave the mic permanently muted. 20s is well
      // beyond any plausible legitimate response playback duration.
      unmuteFallbackTimer = setTimeout(() => {
        logger.warn("Realtime relay: playback-drained ack timed out, force-unmuting VAD");
        playbackDrained = true;
        maybeUnmuteVad();
      }, 20000);
      maybeUnmuteVad();
      // fall through — relay response.done to browser
    }

    // ── Echo/ambient guard: discard audio buffered during the VAD mute race window ──
    // There is a small latency gap between response.created firing and OpenAI
    // processing the turn_detection:null session.update above. During that window
    // VAD can still detect Marin's speaker output as "speech". If that happens,
    // clear the input buffer immediately so it doesn't interrupt Marin mid-sentence.
    // This is belt-and-suspenders on top of the session.update mute above.
    if (evtType === "input_audio_buffer.speech_started" && responseInFlight) {
      logger.info("Realtime relay: discarding false VAD trigger during Marin response");
      if (openaiWs.readyState === WebSocket.OPEN) {
        openaiWs.send(JSON.stringify({ type: "input_audio_buffer.clear" }));
      }
      return; // do not relay the false speech_started event to the browser
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
        const output = await runTool(name, argsJson, conversationId);

        if (openaiWs.readyState === WebSocket.OPEN) {
          openaiWs.send(
            JSON.stringify({
              type: "conversation.item.create",
              item: { type: "function_call_output", call_id: callId, output },
            }),
          );
          // response.create → fires response.created → relay mutes VAD automatically
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
    // GA event name: response.output_audio_transcript.delta (was response.audio_transcript.delta)
    // NOTE: user audio transcript events (conversation.item.input_audio_transcription.*)
    // are relayed to the browser but deliberately NOT stored in the database.
    if (evtType === "response.output_audio_transcript.delta" && event.delta) {
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
    const raw = data.toString();

    // Client-local signal only — never forward to OpenAI. Sent by the browser
    // once it has actually finished playing all queued Marin audio for the
    // current turn (not just when OpenAI finished generating it).
    try {
      const parsed = JSON.parse(raw) as { type?: string };
      if (parsed.type === "client.mia_playback_done") {
        playbackDrained = true;
        maybeUnmuteVad();
        return;
      }
    } catch {
      // Not JSON (shouldn't happen for our protocol) — fall through and relay as-is
    }

    if (openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.send(raw);
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
