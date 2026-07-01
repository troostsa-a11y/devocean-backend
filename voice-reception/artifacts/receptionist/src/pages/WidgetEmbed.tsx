import { useEffect, useCallback, useRef } from "react";
import { useRealtimeSession } from "@workspace/integrations-openai-ai-react/audio";

export default function WidgetEmbed() {
  const notifyEnded = useCallback(() => {
    window.parent.postMessage({ type: "devocean:callEnded" }, "*");
  }, []);

  const session = useRealtimeSession({
    onDisconnected: notifyEnded,
  });

  const { connect, disconnect } = session;

  const connectRef = useRef<(lang?: string) => Promise<void>>(connect);
  const disconnectRef = useRef(disconnect);
  useEffect(() => { connectRef.current = connect; }, [connect]);
  useEffect(() => { disconnectRef.current = disconnect; }, [disconnect]);

  useEffect(() => {
    window.parent.postMessage({ type: "devocean:embedReady" }, "*");
    function onMessage(evt: MessageEvent) {
      if (!evt.data || typeof evt.data !== "object") return;
      if (evt.data.type === "devocean:connect") {
        const lang = typeof evt.data.lang === "string" ? evt.data.lang : undefined;
        connectRef.current(lang);
      }
      if (evt.data.type === "devocean:disconnect") disconnectRef.current();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return null;
}
