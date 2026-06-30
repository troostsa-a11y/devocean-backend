import { useState, useRef, useEffect, useCallback } from "react";
import { useVoiceRecorder, useVoiceStream, blobToWav } from "@workspace/integrations-openai-ai-react/audio";
import { useCreateOpenaiConversation } from "@workspace/api-client-react";
import { Mic, Square, Loader2, AlertCircle, CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceWidgetProps {
  conversationId?: number;
  onConversationCreated?: (id: number) => void;
}

const WEBSITE_FONT =
  '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const EXAMPLE_CHIPS = [
  "What rooms are available?",
  "Best time to see whales?",
  "How do I get to the lodge?",
];

export function VoiceWidget({ conversationId, onConversationCreated }: VoiceWidgetProps) {
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const recorder = useVoiceRecorder();
  const createConv = useCreateOpenaiConversation();
  const abortRef = useRef<AbortController | null>(null);

  const workletPath = `${import.meta.env.BASE_URL}audio-playback-worklet.js`;

  const stream = useVoiceStream({
    workletPath,
    onTranscript: (_, full) => {
      setTranscript(full);
      setErrorMessage(null);
    },
    onComplete: () => setIsProcessing(false),
    onError: (err) => {
      console.error("[VoiceWidget] stream error:", err);
      setIsProcessing(false);
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    },
    onSaveError: (msg) => {
      setSaveWarning(msg);
    },
  });

  const activeConversationIdRef = useRef<number | undefined>(conversationId);
  useEffect(() => {
    activeConversationIdRef.current = conversationId;
  }, [conversationId]);

  const ensureConversation = useCallback(async (): Promise<number> => {
    let id = activeConversationIdRef.current;
    if (!id) {
      const newConv = await createConv.mutateAsync({
        data: { title: "Voice Widget Session" },
      });
      id = newConv.id;
      activeConversationIdRef.current = id;
      onConversationCreated?.(id);
    }
    return id;
  }, [createConv, onConversationCreated]);

  const handleClick = async () => {
    setErrorMessage(null);
    setSaveWarning(null);
    setHasInteracted(true);
    try {
      if (recorder.state === "recording") {
        stream.initAudio().catch(() => {});
        setIsProcessing(true);
        const blob = await recorder.stopRecording();
        const id = activeConversationIdRef.current;
        if (id) {
          const wavBlob = await blobToWav(blob);
          await stream.streamVoiceResponse(
            `/api/openai/conversations/${id}/voice-messages`,
            wavBlob
          );
        } else {
          setIsProcessing(false);
          setErrorMessage("No active conversation. Please try again.");
        }
      } else {
        stream.initAudio().catch(() => {});

        setIsProcessing(true);
        const id = await ensureConversation();
        setIsProcessing(false);
        setTranscript("");
        await recorder.startRecording();
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      console.error("[VoiceWidget] error:", err);
      setIsProcessing(false);
      setErrorMessage(msg);
    }
  };

  const handleChip = async (question: string) => {
    setErrorMessage(null);
    setSaveWarning(null);
    setHasInteracted(true);
    setTranscript(question);
    setIsProcessing(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const id = await ensureConversation();

      const response = await fetch(`/api/openai/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: question }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to send question.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.content) {
              assistantText += payload.content;
              setTranscript(assistantText);
            }
            if (payload.done) break;
            if (payload.error) {
              setSaveWarning(payload.error);
            }
          } catch {
          }
        }
      }
    } catch (err) {
      if ((err as any)?.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      console.error("[VoiceWidget] chip error:", err);
      setErrorMessage(msg);
      setTranscript("");
    } finally {
      setIsProcessing(false);
    }
  };

  const isRecording = recorder.state === "recording";
  const isIdle = !isRecording && !isProcessing && !errorMessage && !hasInteracted;

  return (
    <div
      style={{ fontFamily: WEBSITE_FONT }}
      className="flex flex-col items-center justify-center p-5 bg-card rounded-xl shadow-sm w-full max-w-xs mx-auto"
    >
      <div className="w-16 h-16 mb-3 rounded-full bg-secondary flex items-center justify-center relative">
        {isRecording && (
          <div className="absolute inset-0 rounded-full bg-destructive/20 animate-ping" />
        )}
        <Button
          size="icon"
          className={`w-12 h-12 rounded-full transition-all duration-300 ${
            isRecording
              ? "bg-destructive hover:bg-destructive/90 scale-110 shadow-lg shadow-destructive/20"
              : "bg-primary hover:bg-primary/90"
          }`}
          onClick={handleClick}
          disabled={isProcessing && !isRecording}
          data-testid="button-voice-widget"
        >
          {isProcessing && !isRecording ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : isRecording ? (
            <Square className="w-5 h-5 text-white fill-current" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </Button>
      </div>

      <h3 className="text-base font-bold text-foreground mb-1.5">
        {isRecording ? "Listening..." : isProcessing ? "Processing..." : "Tap the MIC"}
      </h3>

      {errorMessage ? (
        <div className="flex items-start gap-2 text-destructive text-xs text-left max-w-[280px] mt-1" data-testid="voice-widget-error">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="line-clamp-3 overflow-hidden">{errorMessage}</span>
        </div>
      ) : transcript || isRecording ? (
        <p className="text-xs text-muted-foreground text-center max-w-[260px] h-9 overflow-hidden text-ellipsis line-clamp-2">
          {transcript || "Speak now..."}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground text-center max-w-[280px] leading-snug line-clamp-4">
          Ask about the Lodge, accommodation options, rates &amp; availability, experiences and more.
        </p>
      )}

      {isIdle && (
        <div className="mt-3 flex flex-col gap-1.5 w-full" data-testid="widget-chips">
          {EXAMPLE_CHIPS.map((q) => (
            <button
              key={q}
              onClick={() => handleChip(q)}
              data-testid={`chip-${q.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
              className="w-full text-left text-xs px-3 py-1.5 rounded-full border border-primary/25 text-primary/80 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-colors cursor-pointer leading-snug"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {saveWarning && (
        <div
          className="flex items-start gap-1.5 text-amber-600 dark:text-amber-400 text-xs text-left max-w-[280px] mt-2 bg-amber-50 dark:bg-amber-950/30 rounded-md px-2 py-1.5"
          data-testid="voice-widget-save-warning"
        >
          <CloudOff className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{saveWarning}</span>
        </div>
      )}

      {stream.playbackState === "playing" && (
        <div className="mt-2 flex items-center gap-2 text-primary text-sm font-medium">
          <Loader2 className="w-4 h-4 animate-spin" />
          Assistant is speaking...
        </div>
      )}
    </div>
  );
}
