import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer, type Server } from "node:http";
import { WebSocket, type WebSocketServer } from "ws";
import { randomUUID } from "node:crypto";

const state = vi.hoisted(() => ({
  owner: vi.fn(), quota: vi.fn(), work: vi.fn(), release: vi.fn(), relay: vi.fn(),
}));
vi.mock("@workspace/db", async () => ({ ...await import("@workspace/db/schema"), db: {} }));
vi.mock("./conversations", async (original) => ({
  ...await original<typeof import("./conversations")>(), authorizeConversation: state.owner,
}));
vi.mock("./abuse", async (original) => ({
  ...await original<typeof import("./abuse")>(), consumeLimits: state.quota, acquireWork: state.work,
}));
vi.mock("../routes/openaiRealtimeRelay", () => ({ handleRealtimeWs: state.relay }));
import { attachRealtimeGateway } from "./realtimeGateway";
import { AbuseLimitError } from "./abuse";

let server: Server, wss: WebSocketServer, url: string;
const protocols = ["marin-v1", `conversation.${"a".repeat(43)}`];
const clients: WebSocket[] = [];
function connect(path = url, offered = protocols, origin = "https://devoceanlodge.com") {
  return new Promise<WebSocket | number>((resolve) => {
    const ws = new WebSocket(path, offered, { origin });
    clients.push(ws);
    ws.once("open", () => resolve(ws));
    ws.once("unexpected-response", (_req, response) => {
      response.resume(); ws.terminate(); resolve(response.statusCode!);
    });
    ws.on("error", () => {});
  });
}
beforeEach(async () => {
  vi.clearAllMocks();
  state.owner.mockResolvedValue(101); state.quota.mockResolvedValue(undefined);
  state.release.mockResolvedValue(undefined); state.work.mockResolvedValue(state.release);
  state.relay.mockImplementation((ws: WebSocket) => ws.send('{"type":"session.ready"}'));
  server = createServer();
  wss = attachRealtimeGateway(server);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  url = `ws://127.0.0.1:${(server.address() as { port: number }).port}/api/openai/realtime/ws?conversationId=${randomUUID()}&lang=en`;
});
afterEach(async () => {
  for (const ws of clients.splice(0)) ws.terminate();
  for (const ws of wss.clients) ws.terminate();
  await new Promise<void>((resolve) => wss.close(() => resolve()));
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe("Realtime upgrade authorization before a paid relay", () => {
  it("rejects invalid origins and missing protocol credentials without checking history or opening OpenAI", async () => {
    expect(await connect(url, protocols, "https://evil.test")).toBe(403);
    expect(await connect(url, [], "https://devoceanlodge.com")).toBe(401);
    expect(await connect(url.replace(/conversationId=[^&]+/, "conversationId=101"))).toBe(401);
    expect(await connect(url.replace("/realtime/ws?", "/realtime/ws-evil?"))).toBe(404);
    expect(state.owner).not.toHaveBeenCalled(); expect(state.relay).not.toHaveBeenCalled();
  });
  it("rejects foreign and expired ownership before quota or upstream work", async () => {
    state.owner.mockResolvedValue(null);
    expect(await connect()).toBe(401);
    expect(state.quota).not.toHaveBeenCalled(); expect(state.work).not.toHaveBeenCalled();
    expect(state.relay).not.toHaveBeenCalled();
  });
  it("fails closed for quota, concurrency and database failures", async () => {
    state.quota.mockRejectedValueOnce(new AbuseLimitError());
    expect(await connect()).toBe(429);
    state.work.mockRejectedValueOnce(new AbuseLimitError());
    expect(await connect()).toBe(429);
    state.owner.mockRejectedValueOnce(new Error("database unavailable"));
    expect(await connect()).toBe(503);
    expect(state.relay).not.toHaveBeenCalled();
  });
  it("passes only a canonical owned ID to the relay, does not echo the token, and releases on disconnect", async () => {
    const result = await connect();
    expect(result).toBeInstanceOf(WebSocket);
    const ws = result as WebSocket;
    expect(ws.protocol).toBe("marin-v1");
    expect(state.relay.mock.calls[0][3]).toEqual({ conversationId: 101, ip: "127.0.0.1" });
    expect(state.owner.mock.calls[0][1]).toBe("a".repeat(43));
    const closed = new Promise<void>((resolve) => ws.once("close", () => resolve()));
    ws.close(); await closed;
    expect(state.release).toHaveBeenCalled();
  });
  it("bounds client frame sizes without crashing the server", async () => {
    const ws = await connect() as WebSocket;
    const closed = new Promise<number>((resolve) => ws.once("close", (code) => resolve(code)));
    ws.send("x".repeat(33 * 1024));
    expect(await closed).toBe(1009);
    expect(state.release).toHaveBeenCalled();
  });
});
