import { useState, useRef, useCallback } from "react";

export type RealtimeStatus = "idle" | "connecting" | "connected" | "error";

export interface UseRealtimeSessionOptions {
  onUserSpeaking?: (speaking: boolean) => void;
  onUserTranscript?: (full: string) => void;
  onMiaTranscriptDelta?: (delta: string, full: string) => void;
  onMiaSpeaking?: (speaking: boolean) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (message: string) => void;
}

/** Float32 PCM → Int16 PCM16 */
function toPCM16(float32: Float32Array): Int16Array {
  const out = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    out[i] = Math.max(-32768, Math.min(32767, Math.round(float32[i] * 32767)));
  }
  return out;
}

/** Uint8Array → base64 (avoids spread stack-overflow on large arrays) */
function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

/** base64 → Uint8Array */
function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

/** PCM16 Uint8Array → Float32 samples (for AudioBuffer) */
function pcm16ToFloat32(bytes: Uint8Array): Float32Array<ArrayBuffer> {
  const int16 = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
  const out = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) out[i] = int16[i] / 32768;
  return out;
}

export function useRealtimeSession({
  onUserSpeaking,
  onUserTranscript,
  onMiaTranscriptDelta,
  onMiaSpeaking,
  onConnected,
  onDisconnected,
  onError,
}: UseRealtimeSessionOptions = {}) {
  const [status, setStatus] = useState<RealtimeStatus>("idle");
  const [userTranscript, setUserTranscript] = useState("");
  const [miaTranscript, setMiaTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef(0);
  const playingSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const miaFullRef = useRef("");
  const miaSpeakingRef = useRef(false);
  const guardRef = useRef(false);

  const cbRef = useRef({
    onUserSpeaking,
    onUserTranscript,
    onMiaTranscriptDelta,
    onMiaSpeaking,
    onConnected,
    onDisconnected,
    onError,
  });
  cbRef.current = {
    onUserSpeaking,
    onUserTranscript,
    onMiaTranscriptDelta,
    onMiaSpeaking,
    onConnected,
    onDisconnected,
    onError,
  };

  const setMiaSpeakingState = useCallback((speaking: boolean) => {
    if (miaSpeakingRef.current === speaking) return;
    miaSpeakingRef.current = speaking;
    cbRef.current.onMiaSpeaking?.(speaking);
  }, []);

  const stopPlayback = useCallback(() => {
    playingSourcesRef.current.forEach((s) => { try { s.stop(); } catch { /* already stopped */ } });
    playingSourcesRef.current = [];
    nextPlayTimeRef.current = 0;
  }, []);

  const disconnect = useCallback(() => {
    processorRef.current?.disconnect();
    processorRef.current = null;

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    stopPlayback();

    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      wsRef.current.close();
    }
    wsRef.current = null;

    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
    }
    audioCtxRef.current = null;

    guardRef.current = false;
    miaSpeakingRef.current = false;
    miaFullRef.current = "";

    setStatus("idle");
    cbRef.current.onMiaSpeaking?.(false);
    cbRef.current.onDisconnected?.();
  }, [stopPlayback]);

  const connect = useCallback(async () => {
    if (guardRef.current || wsRef.current) return;
    guardRef.current = true;

    setStatus("connecting");
    setError(null);
    setUserTranscript("");
    setMiaTranscript("");
    miaFullRef.current = "";
    nextPlayTimeRef.current = 0;

    try {
      // Acquire mic while we still have a user-gesture on the call stack
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
      });
      streamRef.current = stream;

      // AudioContext at 24 kHz — matches OpenAI Realtime PCM16 sample rate
      const audioCtx = new AudioContext({ sampleRate: 24000 });
      audioCtxRef.current = audioCtx;
      if (audioCtx.state === "suspended") await audioCtx.resume();

      // ── PCM16 playback helper ──────────────────────────────────────────────
      function playPCM16Chunk(b64: string) {
        const ctx = audioCtxRef.current;
        if (!ctx || ctx.state === "closed") return;
        const samples = pcm16ToFloat32(fromBase64(b64));
        const buf = ctx.createBuffer(1, samples.length, 24000);
        buf.copyToChannel(samples, 0);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        const now = ctx.currentTime;
        const start = Math.max(now, nextPlayTimeRef.current);
        src.start(start);
        nextPlayTimeRef.current = start + buf.duration;
        playingSourcesRef.current.push(src);
        src.onended = () => {
          playingSourcesRef.current = playingSourcesRef.current.filter((s) => s !== src);
          if (playingSourcesRef.current.length === 0) setMiaSpeakingState(false);
        };
      }

      // ── WebSocket connection to our relay ──────────────────────────────────
      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      // Prefer explicit lang param injected by widget-loader from the host page's
      // <html lang="…"> attribute; fall back to the browser's navigator.language.
      const urlLang = new URLSearchParams(window.location.search).get("lang");
      const lang = (urlLang || navigator.language || "en").toLowerCase().split("-")[0];
      const wsUrl = `${proto}//${window.location.host}/api/openai/realtime/ws?lang=${encodeURIComponent(lang)}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onerror = (e) => {
        console.error("[realtime] WebSocket error", e);
      };

      ws.onclose = () => {
        if (wsRef.current === ws) disconnect();
      };

      ws.onmessage = (evt) => {
        let event: Record<string, unknown>;
        try {
          event = JSON.parse(evt.data as string) as Record<string, unknown>;
        } catch { return; }

        // Debug: log every event type so DevTools Console shows the relay stream
        const evtType = event.type as string;
        if (evtType === "error") {
          console.error("[mia:relay] error event", event.error);
        } else if (!evtType.includes(".delta")) {
          // log non-delta events in full; skip deltas to avoid flooding
          console.log("[mia:relay]", evtType, event);
        } else {
          console.log("[mia:relay]", evtType);
        }

        switch (event.type as string) {
          // ── Session ready: relay has connected to OpenAI ─────────────────
          case "session.ready": {
            const micSource = audioCtx.createMediaStreamSource(stream);
            const processor = audioCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            // Route mic through a silent gain so ScriptProcessor stays active
            // without sending mic audio to the speaker
            const silentGain = audioCtx.createGain();
            silentGain.gain.value = 0;
            micSource.connect(processor);
            processor.connect(silentGain);
            silentGain.connect(audioCtx.destination);

            processor.onaudioprocess = (e) => {
              if (ws.readyState !== WebSocket.OPEN) return;
              const float32 = e.inputBuffer.getChannelData(0);
              const audio = toBase64(new Uint8Array(toPCM16(float32).buffer));
              ws.send(JSON.stringify({ type: "input_audio_buffer.append", audio }));
            };

            setStatus("connected");
            cbRef.current.onConnected?.();
            break;
          }

          // ── VAD ───────────────────────────────────────────────────────────
          case "input_audio_buffer.speech_started":
            setUserTranscript("");
            miaFullRef.current = "";
            setMiaTranscript("");
            stopPlayback(); // interrupt any playing Mia audio
            cbRef.current.onUserSpeaking?.(true);
            break;

          case "input_audio_buffer.speech_stopped":
            cbRef.current.onUserSpeaking?.(false);
            break;

          // ── User transcript (server-side Whisper) ─────────────────────────
          case "conversation.item.input_audio_transcription.delta":
            if (event.delta) {
              setUserTranscript((prev) => {
                const next = prev + (event.delta as string);
                cbRef.current.onUserTranscript?.(next);
                return next;
              });
            }
            break;

          // ── Mia transcript (GA: response.output_audio_transcript.delta) ───
          case "response.output_audio_transcript.delta":
            if (event.delta) {
              miaFullRef.current += event.delta as string;
              const full = miaFullRef.current;
              setMiaTranscript(full);
              cbRef.current.onMiaTranscriptDelta?.(event.delta as string, full);
            }
            break;

          // ── Mia audio (GA: response.output_audio.delta) ───────────────────
          case "response.output_audio.delta":
            setMiaSpeakingState(true);
            if (event.delta) playPCM16Chunk(event.delta as string);
            break;

          case "response.output_audio.done":
            // All chunks queued; onended callbacks handle setMiaSpeakingState(false)
            break;

          case "response.done":
            if (playingSourcesRef.current.length === 0) setMiaSpeakingState(false);
            break;

          // ── Errors ────────────────────────────────────────────────────────
          case "error": {
            const errObj = event.error as Record<string, unknown> | undefined;
            const msg = (errObj?.message as string) ?? "Voice session error";
            console.error("[realtime] OpenAI error event:", event.error);
            setError(msg);
            setStatus("error");
            cbRef.current.onError?.(msg);
            disconnect();
            break;
          }
        }
      };

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to connect";
      setError(msg);
      setStatus("error");
      cbRef.current.onError?.(msg);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = null;
      wsRef.current?.close();
      wsRef.current = null;
      guardRef.current = false;
    }
  }, [disconnect, setMiaSpeakingState, stopPlayback]);

  return { status, userTranscript, miaTranscript, error, connect, disconnect };
}
