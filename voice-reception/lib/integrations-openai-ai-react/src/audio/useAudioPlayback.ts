/**
 * React hook for streaming audio playback using AudioWorklet.
 * Supports real-time PCM16 audio streaming from SSE responses.
 * Includes sequence buffer for reordering out-of-order chunks.
 */
import { useRef, useCallback, useState } from "react";
import { decodePCM16ToFloat32 } from "./audio-utils";

export type PlaybackState = "idle" | "playing" | "ended";

/**
 * Reorders audio chunks that may arrive out of sequence.
 * Buffers chunks until they can be played in correct order.
 *
 * Example: If chunks arrive as seq 2, seq 0, seq 1:
 * - seq 2 arrives → buffered (waiting for seq 0)
 * - seq 0 arrives → played immediately, then check buffer
 * - seq 1 arrives → played immediately (seq 0 done), seq 2 now plays
 */
class SequenceBuffer {
  private pending = new Map<number, string[]>();
  private nextSeq = 0;

  /** Add chunk with sequence number, returns chunks ready to play in order */
  push(seq: number, data: string): string[] {
    // Store the chunk under its sequence number
    if (!this.pending.has(seq)) {
      this.pending.set(seq, []);
    }
    this.pending.get(seq)!.push(data);

    // Drain consecutive ready sequences
    const ready: string[] = [];
    while (this.pending.has(this.nextSeq)) {
      ready.push(...this.pending.get(this.nextSeq)!);
      this.pending.delete(this.nextSeq);
      this.nextSeq++;
    }
    return ready;
  }

  reset() {
    this.pending.clear();
    this.nextSeq = 0;
  }
}

export function useAudioPlayback(workletPath: string) {
  const [state, setState] = useState<PlaybackState>("idle");
  const ctxRef = useRef<AudioContext | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const readyRef = useRef(false);
  const seqBufferRef = useRef(new SequenceBuffer());

  const init = useCallback(async () => {
    // Even if already initialised, make sure the context is running — browsers
    // suspend AudioContexts created/used outside a user gesture, which results
    // in the worklet producing silence.
    if (readyRef.current) {
      if (ctxRef.current && ctxRef.current.state === "suspended") {
        await ctxRef.current.resume().catch(() => {});
      }
      return;
    }
    if (!workletPath) {
      throw new Error("workletPath is required for audio playback");
    }

    const AudioCtx: typeof AudioContext =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx({ sampleRate: 24000 });
    await ctx.audioWorklet.addModule(workletPath);
    const worklet = new AudioWorkletNode(ctx, "audio-playback-processor");
    worklet.connect(ctx.destination);

    worklet.port.onmessage = (e) => {
      if (e.data.type === "ended") setState("idle");
    };

    // AudioContexts often start "suspended" (autoplay policy). Resume now while
    // we are (ideally) still inside the user gesture that triggered init().
    if (ctx.state === "suspended") {
      await ctx.resume().catch(() => {});
    }

    ctxRef.current = ctx;
    workletRef.current = worklet;
    readyRef.current = true;
  }, [workletPath]);

  /** Resume the AudioContext if the browser left it suspended. */
  const ensureRunning = useCallback(() => {
    const ctx = ctxRef.current;
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  }, []);

  /** Push audio directly (no sequencing) - for simple streaming */
  const pushAudio = useCallback((base64Audio: string) => {
    if (!workletRef.current) return;
    ensureRunning();
    const samples = decodePCM16ToFloat32(base64Audio);
    workletRef.current.port.postMessage({ type: "audio", samples });
    setState("playing");
  }, [ensureRunning]);

  /** Push audio with sequence number - reorders before playback */
  const pushSequencedAudio = useCallback((seq: number, base64Audio: string) => {
    if (!workletRef.current) return;
    ensureRunning();

    const readyChunks = seqBufferRef.current.push(seq, base64Audio);
    for (const chunk of readyChunks) {
      const samples = decodePCM16ToFloat32(chunk);
      workletRef.current.port.postMessage({ type: "audio", samples });
    }
    if (readyChunks.length > 0) {
      setState("playing");
    }
  }, [ensureRunning]);

  const signalComplete = useCallback(() => {
    workletRef.current?.port.postMessage({ type: "streamComplete" });
  }, []);

  const clear = useCallback(() => {
    workletRef.current?.port.postMessage({ type: "clear" });
    seqBufferRef.current.reset();
    setState("idle");
  }, []);

  return { state, init, pushAudio, pushSequencedAudio, signalComplete, clear };
}
