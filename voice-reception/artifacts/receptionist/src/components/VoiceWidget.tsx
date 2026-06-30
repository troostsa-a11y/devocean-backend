import { useState, useRef, useEffect } from "react";
import { useVoiceRecorder, useVoiceStream, blobToWav } from "@workspace/integrations-openai-ai-react/audio";
import { useCreateOpenaiConversation } from "@workspace/api-client-react";
import { Mic, Square, Loader2, AlertCircle, CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceWidgetProps {
  conversationId?: number;
  onConversationCreated?: (id: number) => void;
}

// Match the DEVOCEAN Lodge website brand font (Inter). Inter is loaded in
// index.html <head>; we fall back to the OS system sans-serif stack.
const WEBSITE_FONT =
  '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export function VoiceWidget({ conversationId, onConversationCreated }: VoiceWidgetProps) {
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const recorder = useVoiceRecorder();
  const createConv = useCreateOpenaiConversation();

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

  const handleClick = async () => {
    setErrorMessage(null);
    setSaveWarning(null);
    try {
      if (recorder.state === "recording") {
        // Resume the AudioContext while we are still inside this click gesture —
        // desktop browsers ignore resume() calls made later during SSE streaming.
        stream.initAudio().catch(() => {});
        setIsProcessing(true);
        const blob = await recorder.stopRecording();
        const id = activeConversationIdRef.current;
        if (id) {
          // OpenAI's audio API only accepts wav/mp3, so convert the browser
          // recording (webm/opus or mp4/aac) to WAV in-browser before sending.
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
        // Kick off AudioContext initialisation immediately while we are still
        // inside the user-gesture event handler — before any awaits. This is
        // required by Safari and Chrome's autoplay policy.
        stream.initAudio().catch(() => {
          // Failure is handled gracefully inside streamVoiceResponse; this
          // fire-and-forget is just to warm up the AudioContext in time.
        });

        let id = activeConversationIdRef.current;
        if (!id) {
          setIsProcessing(true);
          const newConv = await createConv.mutateAsync({
            data: { title: "Voice Widget Session" },
          });
          id = newConv.id;
          activeConversationIdRef.current = id;
          onConversationCreated?.(id);
          setIsProcessing(false);
        }
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

  const isRecording = recorder.state === "recording";

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
