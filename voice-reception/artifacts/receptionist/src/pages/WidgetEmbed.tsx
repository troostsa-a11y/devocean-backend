import { useState, useRef, useEffect } from "react";
import { useRealtimeSession } from "@workspace/integrations-openai-ai-react/audio";
import { Mic, PhoneOff, Loader2, AlertCircle, Radio } from "lucide-react";

const FONT =
  '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const ORANGE = "#f97316";
const GREEN  = "#16a34a";

export default function WidgetEmbed() {
  const [miaSpeaking, setMiaSpeaking]   = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);

  // True when the page is opened directly in the browser (not embedded in an
  // iframe). In that case a "Start call" button is shown so the page can be
  // used for device-testing without the parent widget-loader.
  const isStandalone = window.self === window.top;

  const session = useRealtimeSession({
    onDisconnected: () => {
      setMiaSpeaking(false);
      setUserSpeaking(false);
      window.parent.postMessage({ type: "devocean:callEnded" }, "*");
    },
    onConnected: () => {
      window.parent.postMessage({ type: "devocean:status", status: "connected" }, "*");
    },
    onMiaSpeaking: (speaking) => {
      setMiaSpeaking(speaking);
    },
    onUserSpeaking: setUserSpeaking,
    onError: (msg) => {
      window.parent.postMessage({ type: "devocean:status", status: "error", message: msg }, "*");
    },
  });

  const { connect, disconnect, status, error, miaTranscript, userTranscript } = session;

  // Stable refs so the postMessage listener can always call the latest version.
  const connectRef    = useRef(connect);
  const disconnectRef = useRef(disconnect);
  useEffect(() => { connectRef.current    = connect;    }, [connect]);
  useEffect(() => { disconnectRef.current = disconnect; }, [disconnect]);

  useEffect(() => {
    // Announce readiness to parent page (widget-loader) so it can trigger connect.
    window.parent.postMessage({ type: "devocean:embedReady" }, "*");

    function onMessage(evt: MessageEvent) {
      if (!evt.data || typeof evt.data !== "object") return;
      // lang + currency are already encoded in the iframe URL and picked up by
      // useRealtimeSession.connect() from window.location.search — no need to
      // pass them through postMessage.
      if (evt.data.type === "devocean:connect")    connectRef.current();
      if (evt.data.type === "devocean:disconnect") disconnectRef.current();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const isConnected  = status === "connected";
  const isConnecting = status === "connecting";
  const isError      = status === "error";
  const isIdle       = status === "idle";

  const accentColor  = isError ? "#ef4444" : (isConnected && miaSpeaking) ? GREEN : ORANGE;
  const displayText  = isConnected ? (miaTranscript || userTranscript) : null;

  function statusLabel() {
    if (isConnecting)                        return "Connecting…";
    if (isError)                             return "Connection error";
    if (isConnected && miaSpeaking)          return "Marin is speaking";
    if (isConnected && userSpeaking)         return "Listening…";
    if (isConnected)                         return "Say anything";
    if (isIdle && isStandalone)              return "Ready to call";
    return "Starting call…";
  }

  return (
    <div style={{ fontFamily: FONT, height: "100%", display: "flex", flexDirection: "column", background: "white", borderRadius: 16, overflow: "hidden" }}>
      {/* Keyframes ─ ping animation + spinner */}
      <style>{`
        html, body { overflow: hidden; margin: 0; padding: 0; height: 100%; }
        @keyframes dv-embed-ping {
          0%   { transform: scale(1);   opacity: .18; }
          70%  { transform: scale(1.7); opacity: 0;   }
          100% { transform: scale(1.7); opacity: 0;   }
        }
        @keyframes dv-embed-spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{ background: ORANGE, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white" }}>
            M
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "white", lineHeight: 1 }}>Marin</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.75)", marginTop: 2 }}>DEVOCEAN Lodge · Voice</div>
          </div>
        </div>

        {(isConnected || isConnecting) && (
          <button
            type="button"
            onClick={() => disconnectRef.current()}
            style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 8, color: "white", fontSize: 11, padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            <PhoneOff size={12} /> End
          </button>
        )}
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "18px 16px", gap: 10 }}>

        {/* Animated orb */}
        <div style={{ position: "relative", width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isConnected && (miaSpeaking || userSpeaking) && (
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              background: accentColor,
              animation: "dv-embed-ping 1.2s ease-out infinite",
            }} />
          )}
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: isError ? "#fee2e2" : accentColor,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 16px ${accentColor}44`,
            transition: "background .3s, transform .3s",
            transform: (isConnected && (miaSpeaking || userSpeaking)) ? "scale(1.06)" : "scale(1)",
          }}>
            {isConnecting ? (
              <Loader2 size={26} color="white" style={{ animation: "dv-embed-spin 1s linear infinite" }} />
            ) : isError ? (
              <AlertCircle size={26} color="#ef4444" />
            ) : isConnected ? (
              miaSpeaking
                ? <Radio size={26} color="white" />
                : <Mic size={26} color="white" style={{ opacity: userSpeaking ? 1 : .88 }} />
            ) : (
              <Mic size={26} color="white" />
            )}
          </div>
        </div>

        {/* Status text */}
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", textAlign: "center" }}>
          {statusLabel()}
        </div>

        {/* Error detail */}
        {isError && error && (
          <div style={{ fontSize: 11, color: "#ef4444", textAlign: "center", maxWidth: 220, lineHeight: 1.45 }}>
            {error}
          </div>
        )}

        {/* Live transcript snippet */}
        {displayText && (
          <div style={{ fontSize: 11, color: "#64748b", textAlign: "center", maxWidth: 220, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const }}>
            {displayText}
          </div>
        )}

        {/* Standalone-only: start call button */}
        {isStandalone && isIdle && (
          <button
            type="button"
            onClick={() => connectRef.current()}
            style={{ marginTop: 6, padding: "8px 22px", borderRadius: 999, background: ORANGE, color: "white", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}
          >
            Start call
          </button>
        )}

        {/* Standalone-only: end call shortcut */}
        {isStandalone && isConnected && (
          <button
            type="button"
            onClick={() => disconnectRef.current()}
            style={{ marginTop: 4, padding: "6px 16px", borderRadius: 999, background: "#fef2f2", color: "#ef4444", fontSize: 12, fontWeight: 500, border: "1px solid #fecaca", cursor: "pointer" }}
          >
            End call
          </button>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <div style={{ fontSize: 10, color: "#94a3b8", textAlign: "center", paddingBottom: 8, flexShrink: 0 }}>
        Powered by DEVOCEAN AI
      </div>
    </div>
  );
}
