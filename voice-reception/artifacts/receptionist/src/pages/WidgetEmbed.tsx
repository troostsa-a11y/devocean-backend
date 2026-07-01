import { useEffect, useState, useCallback, useRef } from "react";
import { useRealtimeSession } from "@workspace/integrations-openai-ai-react/audio";
import { Loader2, AlertCircle, PhoneOff } from "lucide-react";

const FONT =
  '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export default function WidgetEmbed() {
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [miaSpeaking, setMiaSpeaking] = useState(false);

  const notifyEnded = useCallback(() => {
    window.parent.postMessage({ type: "devocean:callEnded" }, "*");
  }, []);

  const session = useRealtimeSession({
    onUserSpeaking: setUserSpeaking,
    onMiaSpeaking: setMiaSpeaking,
    onDisconnected: notifyEnded,
  });

  const { status, miaTranscript, userTranscript, connect, disconnect } = session;

  // Keep stable refs so the message listener never captures stale closures
  const connectRef = useRef(connect);
  const disconnectRef = useRef(disconnect);
  useEffect(() => { connectRef.current = connect; }, [connect]);
  useEffect(() => { disconnectRef.current = disconnect; }, [disconnect]);

  useEffect(() => {
    // Tell parent the embed is mounted and ready
    window.parent.postMessage({ type: "devocean:embedReady" }, "*");

    function onMessage(evt: MessageEvent) {
      if (!evt.data || typeof evt.data !== "object") return;
      if (evt.data.type === "devocean:connect") connectRef.current();
      if (evt.data.type === "devocean:disconnect") disconnectRef.current();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []); // intentionally empty — runs once on mount

  const handleHangUp = useCallback(() => {
    disconnect();
    notifyEnded();
  }, [disconnect, notifyEnded]);

  const isConnecting = status === "connecting";
  const isConnected = status === "connected";
  const isError = status === "error";

  // Show Mia's last words while she's speaking, otherwise the user's live transcript
  const displayText = isConnected
    ? miaSpeaking || miaTranscript
      ? miaTranscript
      : userTranscript
    : null;

  /* ── Animated ring colour ─────────────────────────────────────── */
  const ringColour = miaSpeaking
    ? "rgba(22,163,74,0.35)"   // green — Mia speaking
    : userSpeaking
    ? "rgba(59,130,246,0.35)"  // blue  — user speaking
    : "rgba(22,163,74,0.15)";  // faint idle

  const avatarBg = miaSpeaking
    ? "#16a34a"
    : userSpeaking
    ? "#2563eb"
    : isConnecting
    ? "#9ca3af"
    : isError
    ? "#dc2626"
    : "#16a34a";

  return (
    <div
      style={{ fontFamily: FONT }}
      className="h-screen w-full flex flex-col items-center justify-center gap-5 select-none bg-[#faf7f4]"
    >
      {/* ── Animated avatar ───────────────────────────────────────── */}
      <div className="relative flex items-center justify-center w-28 h-28">
        {/* Pulse ring — only when connected and either party is speaking */}
        {isConnected && (userSpeaking || miaSpeaking) && (
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ backgroundColor: ringColour }}
          />
        )}
        {/* Subtle idle glow when connected but silent */}
        {isConnected && !userSpeaking && !miaSpeaking && (
          <span
            className="absolute inset-0 rounded-full opacity-40 animate-pulse"
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
          ) : isError ? (
            <AlertCircle className="w-8 h-8 text-white" />
          ) : (
            <span className="text-white font-bold text-2xl tracking-tight">M</span>
          )}
        </div>
      </div>

      {/* ── Status label + live transcript ────────────────────────── */}
      <div className="flex flex-col items-center gap-1.5 px-5 max-w-[260px] text-center">
        <p
          className="text-sm font-semibold transition-colors duration-200"
          style={{ color: "#1c1917" }}
        >
          {isConnecting && "Connecting to Mia…"}
          {isConnected && miaSpeaking && "Mia is speaking"}
          {isConnected && userSpeaking && !miaSpeaking && "Listening…"}
          {isConnected && !miaSpeaking && !userSpeaking && "Ask anything"}
          {isError && "Connection error"}
        </p>

        {displayText ? (
          <p
            className="text-xs leading-relaxed line-clamp-4"
            style={{ color: "#78716c" }}
          >
            {displayText}
          </p>
        ) : isError ? (
          <p className="text-xs" style={{ color: "#78716c" }}>
            Please close and try again.
          </p>
        ) : null}
      </div>

      {/* ── Hang-up button ────────────────────────────────────────── */}
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
            transition: "transform 0.15s, box-shadow 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          }}
        >
          <PhoneOff style={{ width: 20, height: 20, color: "#fff" }} />
        </button>
      )}
    </div>
  );
}
