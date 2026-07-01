import { useEffect, useState, useCallback, useRef } from "react";
import { useRealtimeSession } from "@workspace/integrations-openai-ai-react/audio";
import { Loader2, AlertCircle, PhoneOff, Send } from "lucide-react";

const FONT =
  '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

// ── Text-fallback helpers ────────────────────────────────────────────────────

async function createConversation(): Promise<number> {
  const res = await fetch("/api/openai/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Text session (mic unavailable)" }),
  });
  if (!res.ok) throw new Error("Could not start text session");
  const conv = (await res.json()) as { id: number };
  return conv.id;
}

async function* streamTextMessage(
  convId: number,
  content: string,
): AsyncGenerator<string> {
  const res = await fetch(`/api/openai/conversations/${convId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok || !res.body) throw new Error("Stream failed");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const payload = JSON.parse(line.slice(6)) as { content?: string };
        if (payload.content) yield payload.content;
      } catch { /* skip malformed */ }
    }
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function WidgetEmbed() {
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [miaSpeaking, setMiaSpeaking] = useState(false);

  // Text-fallback state (used when mic/speaker is unavailable)
  const [textConvId, setTextConvId] = useState<number | null>(null);
  const [textInput, setTextInput] = useState("");
  const [textResponse, setTextResponse] = useState("");
  const [textLoading, setTextLoading] = useState(false);
  const textareaRef = useRef<HTMLInputElement>(null);

  const notifyEnded = useCallback(() => {
    window.parent.postMessage({ type: "devocean:callEnded" }, "*");
  }, []);

  const session = useRealtimeSession({
    onUserSpeaking: setUserSpeaking,
    onMiaSpeaking: setMiaSpeaking,
    onDisconnected: notifyEnded,
  });

  const { status, miaTranscript, userTranscript, connect, disconnect } = session;

  // Stable refs so the message listener never captures stale closures
  const connectRef = useRef(connect);
  const disconnectRef = useRef(disconnect);
  useEffect(() => { connectRef.current = connect; }, [connect]);
  useEffect(() => { disconnectRef.current = disconnect; }, [disconnect]);

  useEffect(() => {
    window.parent.postMessage({ type: "devocean:embedReady" }, "*");
    function onMessage(evt: MessageEvent) {
      if (!evt.data || typeof evt.data !== "object") return;
      if (evt.data.type === "devocean:connect") connectRef.current();
      if (evt.data.type === "devocean:disconnect") disconnectRef.current();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const handleHangUp = useCallback(() => {
    disconnect();
    notifyEnded();
  }, [disconnect, notifyEnded]);

  const handleTextSend = useCallback(async () => {
    const q = textInput.trim();
    if (!q || textLoading) return;
    setTextInput("");
    setTextLoading(true);
    setTextResponse("");
    try {
      let convId = textConvId;
      if (!convId) {
        convId = await createConversation();
        setTextConvId(convId);
      }
      for await (const chunk of streamTextMessage(convId, q)) {
        setTextResponse((prev) => prev + chunk);
      }
    } catch {
      setTextResponse("Sorry, something went wrong. Please try again.");
    } finally {
      setTextLoading(false);
      textareaRef.current?.focus();
    }
  }, [textInput, textLoading, textConvId]);

  const isConnecting = status === "connecting";
  const isConnected = status === "connected";
  const isError = status === "error";

  const displayText = isConnected
    ? miaSpeaking || miaTranscript
      ? miaTranscript
      : userTranscript
    : null;

  const ringColour = miaSpeaking
    ? "rgba(22,163,74,0.35)"
    : userSpeaking
    ? "rgba(59,130,246,0.35)"
    : "rgba(22,163,74,0.15)";

  const avatarBg = miaSpeaking
    ? "#16a34a"
    : userSpeaking
    ? "#2563eb"
    : isConnecting
    ? "#9ca3af"
    : isError
    ? "#dc2626"
    : "#16a34a";

  // ── Text fallback (mic unavailable) ───────────────────────────────────────
  if (isError) {
    return (
      <div
        style={{ fontFamily: FONT }}
        className="h-screen w-full flex flex-col bg-[#faf7f4] select-none"
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "#16a34a" }}
          >
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: "#1c1917" }}>
              Mia — DEVOCEAN receptionist
            </p>
            <p className="text-[11px]" style={{ color: "#a8a29e" }}>
              Mic unavailable — text mode
            </p>
          </div>
        </div>

        {/* Response area */}
        <div className="flex-1 overflow-y-auto px-4 py-1 text-xs leading-relaxed" style={{ color: "#57534e" }}>
          {textLoading && !textResponse && (
            <div className="flex items-center gap-1.5 text-[#a8a29e]">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Thinking…</span>
            </div>
          )}
          {textResponse && (
            <p className="whitespace-pre-wrap">{textResponse}</p>
          )}
          {!textLoading && !textResponse && (
            <p style={{ color: "#a8a29e" }}>
              Ask me about the lodge, rooms, rates, availability or experiences.
            </p>
          )}
        </div>

        {/* Input row */}
        <div className="flex items-center gap-2 px-3 pb-3 pt-2 border-t" style={{ borderColor: "#e7e5e4" }}>
          <input
            ref={textareaRef}
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleTextSend();
              }
            }}
            placeholder="Type a question…"
            disabled={textLoading}
            style={{
              flex: 1,
              fontSize: 12,
              padding: "6px 10px",
              borderRadius: 20,
              border: "1px solid #d6d3d1",
              outline: "none",
              background: "#fff",
              color: "#1c1917",
            }}
          />
          <button
            onClick={() => void handleTextSend()}
            disabled={!textInput.trim() || textLoading}
            aria-label="Send"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: textInput.trim() && !textLoading ? "#16a34a" : "#d6d3d1",
              border: "none",
              cursor: textInput.trim() && !textLoading ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 0.15s",
            }}
          >
            {textLoading
              ? <Loader2 style={{ width: 14, height: 14, color: "#fff" }} className="animate-spin" />
              : <Send style={{ width: 14, height: 14, color: "#fff" }} />
            }
          </button>
        </div>
      </div>
    );
  }

  // ── Normal voice UI ────────────────────────────────────────────────────────
  return (
    <div
      style={{ fontFamily: FONT }}
      className="h-screen w-full flex flex-col items-center justify-center gap-5 select-none bg-[#faf7f4]"
    >
      {/* Animated avatar */}
      <div className="relative flex items-center justify-center w-28 h-28">
        {isConnected && (userSpeaking || miaSpeaking) && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-40"
            style={{ backgroundColor: ringColour }}
          />
        )}
        {isConnected && !userSpeaking && !miaSpeaking && (
          <span
            className="absolute inset-0 rounded-full opacity-30 animate-pulse"
            style={{ backgroundColor: "rgba(22,163,74,0.12)" }}
          />
        )}
        <div
          className="w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all duration-300 shadow-md"
          style={{
            backgroundColor: avatarBg,
            transform:
              (miaSpeaking || userSpeaking) && isConnected ? "scale(1.12)" : "scale(1)",
          }}
        >
          {isConnecting ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <span className="text-white font-bold text-2xl tracking-tight">M</span>
          )}
        </div>
      </div>

      {/* Status + transcript */}
      <div className="flex flex-col items-center gap-1.5 px-5 max-w-[260px] text-center">
        <p className="text-sm font-semibold" style={{ color: "#1c1917" }}>
          {isConnecting && "Connecting to Mia…"}
          {isConnected && miaSpeaking && "Mia is speaking"}
          {isConnected && userSpeaking && !miaSpeaking && "Listening…"}
          {isConnected && !miaSpeaking && !userSpeaking && "Ask anything"}
        </p>
        {displayText && (
          <p
            className="text-xs leading-relaxed line-clamp-4"
            style={{ color: "#78716c" }}
          >
            {displayText}
          </p>
        )}
      </div>

      {/* Hang-up */}
      {(isConnected || isConnecting) && (
        <button
          onClick={handleHangUp}
          aria-label="End call"
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#dc2626",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 12px rgba(220,38,38,0.35)",
            flexShrink: 0,
          }}
        >
          <PhoneOff style={{ width: 20, height: 20, color: "#fff" }} />
        </button>
      )}
    </div>
  );
}
