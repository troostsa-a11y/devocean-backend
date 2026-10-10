import type { Server } from "node:http";
import { WebSocketServer } from "ws";
import { authorizeConversation, PUBLIC_ID_PATTERN } from "./conversations";
import { originAllowed, clientAddress } from "./origins";
import { AbuseLimitError, acquireWork, aiLimits, consumeLimits, REALTIME_DURATION_MS } from "./abuse";
import { handleRealtimeWs } from "../routes/openaiRealtimeRelay";
import { hashSecret } from "./secrets";

export function attachRealtimeGateway(server: Server): WebSocketServer {
  const wss = new WebSocketServer({
    noServer: true, maxPayload: 32 * 1024, perMessageDeflate: false,
    handleProtocols: (protocols) => protocols.has("marin-v1") ? "marin-v1" : false,
  });
  const attempts = new Map<string, { count: number; until: number }>();
  let pending = 0;
  let total = { count: 0, until: 0 };
  server.on("upgrade", async (req, socket, head) => {
    socket.on("error", () => {});
    const reject = (status: number) => {
      if (!socket.destroyed) {
        socket.end(`HTTP/1.1 ${status} ${status === 429 ? "Too Many Requests" : "Request Rejected"}\r\nConnection: close\r\nContent-Length: 0\r\n${status === 429 ? "Retry-After: 60\r\n" : ""}\r\n`);
      }
    };
    let url: URL;
    try { url = new URL(req.url ?? "/", "http://relay.invalid"); }
    catch { reject(400); return; }
    if (url.pathname !== "/api/openai/realtime/ws") { reject(404); return; }
    if (!originAllowed(req.headers.origin)) { reject(403); return; }
    if (req.url!.length > 2048 || head.length > 32 * 1024) { reject(400); return; }
    const now = Date.now();
    if (total.until <= now) {
      total = { count: 0, until: now + 60_000 };
      for (const [key, entry] of attempts) if (entry.until <= now) attempts.delete(key);
    }
    const ip = clientAddress(req);
    const key = hashSecret(ip);
    let entry = attempts.get(key);
    if (entry && entry.until <= now) { attempts.delete(key); entry = undefined; }
    if (!entry && attempts.size < 1000) {
      entry = { count: 0, until: now + 60_000 };
      attempts.set(key, entry);
    }
    if (!entry || ++entry.count > 12 || ++total.count > 60 || pending >= 16) { reject(429); return; }
    const protocols = req.headers["sec-websocket-protocol"]?.split(",").map((value) => value.trim()) ?? [];
    const credential = protocols.find((value) => /^conversation\.[A-Za-z0-9_-]{43}$/.test(value));
    const publicId = url.searchParams.get("conversationId") ?? "";
    const lang = url.searchParams.get("lang") ?? "en";
    const currency = url.searchParams.get("currency") ?? undefined;
    if (protocols.length !== 2 || !protocols.includes("marin-v1") || !credential || !PUBLIC_ID_PATTERN.test(publicId)) {
      reject(401); return;
    }
    if (!/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8}){0,3}$/.test(lang) || (currency && !/^[A-Za-z]{3}$/.test(currency))) {
      reject(400); return;
    }
    // Credentials go in a subprotocol, never a URL or logged query string.
    pending++;
    let release: (() => Promise<void>) | undefined;
    const timer = setTimeout(() => socket.destroy(), 10_000);
    try {
      const conversationId = await authorizeConversation(publicId, credential.slice("conversation.".length));
      if (!conversationId) { reject(401); return; }
      if (socket.destroyed) return;
      await consumeLimits(aiLimits(ip, conversationId, "realtime"));
      release = await acquireWork(ip, conversationId, REALTIME_DURATION_MS);
      if (socket.destroyed) { await release(); return; }
      const releaseWork = release;
      wss.handleUpgrade(req, socket, head, (ws) => {
        clearTimeout(timer);
        ws.on("error", () => {}); // Oversized/malformed frames must not crash Node.
        ws.once("close", () => { void releaseWork().catch(() => {}); });
        handleRealtimeWs(ws, lang, currency, { conversationId, ip });
      });
    } catch (err) {
      if (release) await release().catch(() => {});
      reject(err instanceof AbuseLimitError ? 429 : 503);
    } finally {
      clearTimeout(timer);
      pending--;
    }
  });
  return wss;
}
