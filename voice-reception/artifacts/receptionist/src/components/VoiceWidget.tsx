import { useState, useRef, useEffect, useCallback } from "react";
import {
  useRealtimeSession,
  type RealtimeStatus,
} from "@workspace/integrations-openai-ai-react/audio";
import { useCreateOpenaiConversation } from "@workspace/api-client-react";
import { Mic, PhoneOff, Loader2, AlertCircle, CloudOff, Radio } from "lucide-react";
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isChipLoading, setIsChipLoading] = useState(false);
  const [chipTranscript, setChipTranscript] = useState("");
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [miaSpeaking, setMiaSpeaking] = useState(false);

  const createConv = useCreateOpenaiConversation();
  const abortRef = useRef<AbortController | null>(null);
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

  const session = useRealtimeSession({
    onUserSpeaking: (speaking) => {
      setUserSpeaking(speaking);
      if (speaking) {
        setChipTranscript("");
        setErrorMessage(null);
      }
    },
    onMiaSpeaking: setMiaSpeaking,
    onError: (msg) => {
      setErrorMessage(msg);
    },
    onConnected: () => {
      setErrorMessage(null);
    },
  });

  const handleStartCall = async () => {
    setHasInteracted(true);
    setErrorMessage(null);
    setSaveWarning(null);
    setChipTranscript("");
    await session.connect();
  };

  const handleEndCall = () => {
    session.disconnect();
    setUserSpeaking(false);
    setMiaSpeaking(false);
  };

  const handleChip = async (question: string) => {
    setErrorMessage(null);
    setSaveWarning(null);
    setHasInteracted(true);
    setChipTranscript(question);
    setIsChipLoading(true);

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
              setChipTranscript(assistantText);
            }
            if (payload.done) break;
            if (payload.error) setSaveWarning(payload.error);
          } catch { }
        }
      }
    } catch (err) {
      if ((err as { name?: string })?.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      console.error("[VoiceWidget] chip error:", err);
      setErrorMessage(msg);
      setChipTranscript("");
    } finally {
      setIsChipLoading(false);
    }
  };

  const { status, userTranscript, miaTranscript } = session;
  const isConnected = status === "connected";
  const isConnecting = status === "connecting";
  const isError = status === "error";
  const isIdle = status === "idle" && !hasInteracted && !isChipLoading && !chipTranscript;

  function getMicLabel(): string {
    if (isConnecting) return "Connecting...";
    if (isConnected && userSpeaking) return "Listening...";
    if (isConnected && miaSpeaking) return "Mia is speaking...";
    if (isConnected) return "Ask Mia anything";
    return "Talk to Mia";
  }

  const displayTranscript = isConnected
    ? (miaSpeaking || miaTranscript ? miaTranscript : userTranscript)
    : chipTranscript;

  return (
    <div
      style={{ fontFamily: WEBSITE_FONT }}
      className="flex flex-col items-center justify-center p-5 bg-card rounded-xl shadow-sm w-full max-w-xs mx-auto"
    >
      <div className="w-16 h-16 mb-3 rounded-full bg-secondary flex items-center justify-center relative">
        {(isConnected && userSpeaking) && (
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        )}
        {(isConnected && miaSpeaking) && (
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-pulse" />
        )}

        {isConnected ? (
          <Button
            size="icon"
            className={`w-12 h-12 rounded-full transition-all duration-300 ${
              miaSpeaking
                ? "bg-emerald-600 scale-105"
                : userSpeaking
                ? "bg-primary scale-110 shadow-lg shadow-primary/20"
                : "bg-primary"
            }`}
            onClick={handleEndCall}
            data-testid="button-end-call"
            title="End call"
          >
            <PhoneOff className="w-5 h-5 text-white" />
          </Button>
        ) : (
          <Button
            size="icon"
            className="w-12 h-12 rounded-full bg-primary transition-all duration-300"
            onClick={handleStartCall}
            disabled={isConnecting}
            data-testid="button-voice-widget"
          >
            {isConnecting ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </Button>
        )}
      </div>

      <h3 className="text-base font-bold text-foreground mb-1.5">
        {getMicLabel()}
      </h3>

      {isConnected && (
        <p className="text-xs text-muted-foreground text-center text-right w-full mb-1">
          <button
            onClick={handleEndCall}
            className="text-destructive/70 hover:text-destructive text-xs underline underline-offset-2 cursor-pointer transition-colors"
            data-testid="button-end-call-text"
          >
            End call
          </button>
        </p>
      )}

      {errorMessage || isError ? (
        <div
          className="flex items-start gap-2 text-destructive text-xs text-left max-w-[280px] mt-1"
          data-testid="voice-widget-error"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="line-clamp-3 overflow-hidden">
            {errorMessage ?? "Voice session error. Please try again."}
          </span>
        </div>
      ) : displayTranscript ? (
        <p className="text-xs text-muted-foreground text-center max-w-[260px] min-h-[2.25rem] overflow-hidden text-ellipsis line-clamp-3">
          {displayTranscript}
        </p>
      ) : isConnected ? (
        <p className="text-xs text-muted-foreground text-center max-w-[280px] leading-snug">
          {userSpeaking ? "Speak now..." : "Tap the mic button above to end the call."}
        </p>
      ) : isChipLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground mt-1">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="text-xs">Thinking...</span>
        </div>
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

      {isConnected && (
        <div className="mt-3 flex items-center gap-1.5 text-muted-foreground text-xs">
          <Radio className="w-3 h-3 text-emerald-500" />
          <span>Live — tap mic button to end call</span>
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
    </div>
  );
}
