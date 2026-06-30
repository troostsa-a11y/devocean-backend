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

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const pendingToolsRef = useRef<Map<string, string>>(new Map());
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

  const disconnect = useCallback(() => {
    dcRef.current?.close();
    dcRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    guardRef.current = false;
    if (audioElRef.current) audioElRef.current.srcObject = null;
    pendingToolsRef.current.clear();
    miaSpeakingRef.current = false;
    setStatus("idle");
    setMiaSpeakingState(false);
    cbRef.current.onDisconnected?.();
  }, [setMiaSpeakingState]);

  const connect = useCallback(async () => {
    if (guardRef.current || pcRef.current) return;
    guardRef.current = true;

    setStatus("connecting");
    setError(null);
    setUserTranscript("");
    setMiaTranscript("");
    miaFullRef.current = "";
    pendingToolsRef.current.clear();

    try {
      const tokenRes = await fetch("/api/openai/realtime/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!tokenRes.ok) {
        const body = await tokenRes.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `Session request failed (${tokenRes.status})`);
      }
      const { clientSecret, model } = await tokenRes.json() as {
        clientSecret: string;
        model: string;
      };

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected" ||
          pc.connectionState === "closed"
        ) {
          disconnect();
        }
      };

      pc.ontrack = (e) => {
        if (!audioElRef.current) {
          audioElRef.current = new Audio();
          audioElRef.current.autoplay = true;
        }
        audioElRef.current.srcObject = e.streams[0];
      };

      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      ms.getTracks().forEach((t) => pc.addTrack(t, ms));

      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      dc.addEventListener("open", () => {
        setStatus("connected");
        cbRef.current.onConnected?.();
      });

      dc.addEventListener("close", () => {
        if (pcRef.current) disconnect();
      });

      dc.addEventListener("message", async (evt) => {
        let event: Record<string, unknown>;
        try { event = JSON.parse(evt.data as string) as Record<string, unknown>; } catch { return; }

        switch (event.type as string) {
          case "input_audio_buffer.speech_started":
            setUserTranscript("");
            miaFullRef.current = "";
            setMiaTranscript("");
            cbRef.current.onUserSpeaking?.(true);
            break;

          case "input_audio_buffer.speech_stopped":
            cbRef.current.onUserSpeaking?.(false);
            break;

          case "conversation.item.input_audio_transcription.delta":
            if (event.delta) {
              setUserTranscript((prev) => {
                const next = prev + (event.delta as string);
                cbRef.current.onUserTranscript?.(next);
                return next;
              });
            }
            break;

          case "response.audio_transcript.delta":
            if (event.delta) {
              miaFullRef.current += event.delta as string;
              const full = miaFullRef.current;
              setMiaTranscript(full);
              cbRef.current.onMiaTranscriptDelta?.(event.delta as string, full);
            }
            break;

          case "response.audio.delta":
            setMiaSpeakingState(true);
            break;

          case "response.audio.done":
            setMiaSpeakingState(false);
            break;

          case "response.done":
            setMiaSpeakingState(false);
            break;

          case "response.output_item.added": {
            const item = event.item as Record<string, unknown> | undefined;
            if (item?.type === "function_call") {
              pendingToolsRef.current.set(
                item.call_id as string,
                item.name as string,
              );
            }
            break;
          }

          case "response.function_call_arguments.done": {
            const callId = event.call_id as string;
            const name = pendingToolsRef.current.get(callId);
            if (!name) break;
            pendingToolsRef.current.delete(callId);
            const argsJson = (event.arguments as string) ?? "{}";

            try {
              const toolRes = await fetch("/api/openai/realtime/execute-tool", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, arguments: argsJson }),
              });
              const { output } = await toolRes.json() as { output: string };

              const dc2 = dcRef.current;
              if (dc2?.readyState === "open") {
                dc2.send(JSON.stringify({
                  type: "conversation.item.create",
                  item: { type: "function_call_output", call_id: callId, output },
                }));
                dc2.send(JSON.stringify({ type: "response.create" }));
              }
            } catch (toolErr) {
              console.error("[realtime] tool execution failed:", toolErr);
            }
            break;
          }

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
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === "complete") { resolve(); return; }
        const onStateChange = () => {
          if (pc.iceGatheringState === "complete") {
            pc.removeEventListener("icegatheringstatechange", onStateChange);
            resolve();
          }
        };
        pc.addEventListener("icegatheringstatechange", onStateChange);
        setTimeout(resolve, 3000);
      });

      const sdpRes = await fetch(
        `https://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${clientSecret}`,
            "Content-Type": "application/sdp",
          },
          body: pc.localDescription!.sdp,
        },
      );

      if (!sdpRes.ok) {
        const detail = await sdpRes.text();
        throw new Error(`WebRTC handshake failed (${sdpRes.status}): ${detail}`);
      }

      await pc.setRemoteDescription({ type: "answer", sdp: await sdpRes.text() });

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to connect";
      setError(msg);
      setStatus("error");
      cbRef.current.onError?.(msg);
      pcRef.current?.close();
      pcRef.current = null;
      dcRef.current = null;
      guardRef.current = false;
    }
  }, [disconnect, setMiaSpeakingState]);

  return { status, userTranscript, miaTranscript, error, connect, disconnect };
}
