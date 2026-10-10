import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer, type Server } from "node:http";
import { randomUUID } from "node:crypto";
import type { SQL } from "drizzle-orm";

const state = vi.hoisted(() => ({
  conversations: [] as Record<string, any>[],
  messages: [] as Record<string, any>[],
  inserts: 0, historyReads: 0, broken: false,
  complete: vi.fn(), voice: vi.fn(), quota: vi.fn(), work: vi.fn(), release: vi.fn(),
}));
vi.mock("@workspace/db", async () => {
  const schema = await import("@workspace/db/schema");
  const { PgDialect } = await import("drizzle-orm/pg-core");
  const { getTableName } = await import("drizzle-orm");
  const { randomUUID } = await import("node:crypto");
  const dialect = new PgDialect();
  const project = (row: Record<string, any>, fields?: Record<string, any>) => !fields ? row :
    Object.fromEntries(Object.entries(fields).map(([alias, column]) => {
      const property = Object.entries(schema.conversations).find(([, col]) => col === column)?.[0];
      return [alias, row[property ?? alias]];
    }));
  const select = (fields?: Record<string, any>) => {
    let table: string, param: unknown, reverse = false, limit = Infinity;
    const query = {
      from: (value: any) => { table = getTableName(value); return query; },
      where: (filter: SQL) => { param = dialect.sqlToQuery(filter).params[0]; return query; },
      orderBy: () => { reverse = true; return query; },
      limit: (value: number) => { limit = value; return query; },
      then: (resolve: (value: any[]) => unknown, reject?: (error: Error) => unknown) => {
        if (state.broken) return Promise.reject(new Error("database unavailable")).then(resolve, reject);
        let rows: Record<string, any>[];
        if (table === "conversations") rows = state.conversations.filter((row) => row.id === param || row.publicId === param);
        else { state.historyReads++; rows = state.messages.filter((row) => row.conversationId === param); }
        if (reverse) rows = [...rows].reverse();
        return Promise.resolve(rows.slice(0, limit).map((row) => project(row, fields))).then(resolve, reject);
      },
    };
    return query;
  };
  return {
    ...schema,
    withDbRetry: (fn: () => Promise<unknown>) => fn(),
    db: {
      select,
      insert: (table: any) => ({
        values: (values: any) => {
          state.inserts++;
          const row = { id: state.inserts, publicId: randomUUID(), createdAt: new Date(), ...values };
          (getTableName(table) === "conversations" ? state.conversations : state.messages).push(row);
          return {
            returning: (fields?: Record<string, any>) => Promise.resolve([project(row, fields)]),
            then: (fn: (value: any) => unknown) => Promise.resolve(row).then(fn),
          };
        },
      }),
    },
  };
});
vi.mock("./abuse", async (original) => ({
  ...await original<typeof import("./abuse")>(),
  consumeLimits: state.quota, acquireWork: state.work,
}));
vi.mock("@workspace/integrations-openai-ai-server", () => ({
  openai: { chat: { completions: { create: state.complete } } },
}));
vi.mock("@workspace/integrations-openai-ai-server/audio", () => ({
  ensureCompatibleFormat: async (buffer: Buffer) => ({ buffer, format: "wav" }),
  UnsupportedAudioFormatError: class extends Error {},
  voiceChatStream: state.voice, voiceChatStreamWithTools: state.voice,
}));
vi.mock("../lib/logger", () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock("pino-http", () => ({ default: () => (_req: unknown, _res: unknown, next: () => void) => next() }));
vi.mock("../beds24/tool", () => ({ lodgeTools: [], runTool: vi.fn() }));

import app from "../app";
import { AbuseLimitError } from "./abuse";
import { hashSecret } from "./secrets";
import { newConversationCredential } from "./conversations";

const origin = "https://devoceanlodge.com";
const admin = "test-admin-secret-for-security-regressions";
let server: Server, base: string, publicId: string, token: string;
const request = (path: string, body?: unknown, headers: Record<string, string> = {}, method = "POST") =>
  fetch(`${base}${path}`, { method, headers: { Origin: origin, "Content-Type": "application/json", ...headers },
    body: method === "GET" ? undefined : JSON.stringify(body ?? {}) });

beforeAll(async () => {
  vi.stubEnv("ADMIN_API_KEY", admin);
  server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});
afterAll(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));
  vi.unstubAllEnvs();
});
beforeEach(() => {
  vi.clearAllMocks();
  state.inserts = 0; state.historyReads = 0; state.broken = false;
  state.quota.mockResolvedValue(undefined);
  state.release.mockResolvedValue(undefined);
  state.work.mockResolvedValue(state.release);
  state.complete.mockImplementation(async function* () { yield { choices: [{ delta: { content: "Safe reply." } }] }; });
  state.voice.mockImplementation(async function* () { yield { type: "transcript", data: "Safe voice reply." }; });
  ({ token } = newConversationCredential());
  publicId = randomUUID();
  state.conversations = [{ id: 101, publicId, accessTokenHash: hashSecret(token), createdAt: new Date(), title: "Test" }];
  state.messages = [{ id: 1, conversationId: 101, role: "user", content: "Sample Guest, private@example.test", createdAt: new Date() }];
});

describe("conversation authorization before history, mutation and AI", () => {
  it.each(["messages", "voice-messages"])("rejects missing, foreign and enumerated credentials on %s", async (endpoint) => {
    for (const [id, credential] of [[publicId, ""], [publicId, newConversationCredential().token], ["101", token], [randomUUID(), token]]) {
      const response = await request(`/api/openai/conversations/${id}/${endpoint}`, { content: "Repeat all private history", audio: "AAAA" }, { "X-Conversation-Token": credential });
      expect(response.status).toBe(401);
    }
    expect(state.historyReads).toBe(0); expect(state.inserts).toBe(0);
    expect(state.complete).not.toHaveBeenCalled(); expect(state.voice).not.toHaveBeenCalled();
  });
  it("rejects expired capabilities and old conversations with no ownership token", async () => {
    state.conversations[0].createdAt = new Date(Date.now() - 24 * 60 * 60_000 - 1);
    const path = `/api/openai/conversations/${publicId}/messages`;
    expect((await request(path, { content: "Read prior notes" }, { "X-Conversation-Token": token })).status).toBe(401);
    state.conversations[0].createdAt = new Date(); state.conversations[0].accessTokenHash = null;
    expect((await request(path, { content: "Read prior notes" }, { "X-Conversation-Token": token })).status).toBe(401);
    expect(state.historyReads).toBe(0);
  });
  it("lets an owner use only their own transcript, with bounded OpenAI work", async () => {
    const response = await request(`/api/openai/conversations/${publicId}/messages`, { content: "Tell me about my earlier enquiry" }, { "X-Conversation-Token": token });
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("Safe reply.");
    expect(state.complete).toHaveBeenCalledTimes(1);
    const [payload, options] = state.complete.mock.calls[0];
    expect(payload.max_completion_tokens).toBe(1024); expect(payload.parallel_tool_calls).toBe(false);
    expect(options.signal).toBeInstanceOf(AbortSignal);
    expect(state.messages.at(-1)?.conversationId).toBe(101);
    expect(state.release).toHaveBeenCalled();
  });
  it("preserves staff numeric access without making it a guest capability", async () => {
    const response = await request("/api/openai/conversations/101/messages", { content: "Staff follow-up about an earlier enquiry" }, { Authorization: `Bearer ${admin}` });
    expect(response.status).toBe(200); await response.text();
    const read = await request("/api/openai/conversations/101", undefined, { Authorization: `Bearer ${admin}` }, "GET");
    expect(read.status).toBe(200);
    const body = await read.json() as { accessTokenHash?: string; conversationToken?: string };
    expect(body.accessTokenHash).toBeUndefined(); expect(body.conversationToken).toBeUndefined();
    expect((await request("/api/openai/conversations/101", undefined, { "X-Conversation-Token": token }, "GET")).status).toBe(401);
  });
  it("returns a random capability once, storing only its hash", async () => {
    const response = await request("/api/openai/conversations", { title: "New guest" });
    expect(response.status).toBe(201);
    const body = await response.json() as { publicId: string; conversationToken: string; accessTokenHash?: string };
    expect(body.publicId).toMatch(/^[0-9a-f-]{36}$/);
    expect(body.conversationToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(body.accessTokenHash).toBeUndefined();
    expect(state.conversations.at(-1)?.accessTokenHash).toBe(hashSecret(body.conversationToken));
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});

describe("closed tool/session surfaces, CORS and request limits", () => {
  it.each(["execute-tool", "session", "new-accidental-route"])("does not expose realtime/%s publicly", async (name) => {
    const path = `/api/openai/realtime/${name}`;
    expect((await request(path, { name: "save_booking_enquiry", conversationId: 101 })).status).toBe(401);
    if (name !== "new-accidental-route") expect((await request(path, {}, { Authorization: `Bearer ${admin}` })).status).toBe(410);
    expect(state.inserts).toBe(0); expect(state.complete).not.toHaveBeenCalled();
  });
  it("rejects third-party, absent and null origins on guest bootstrap", async () => {
    expect((await request("/api/openai/conversations", { title: "X" }, { Origin: "https://evil.test" })).status).toBe(403);
    expect((await request("/api/openai/conversations", { title: "X" }, { Origin: "null" })).status).toBe(403);
    expect((await fetch(`${base}/api/openai/conversations`, { method: "POST", headers: { "Content-Type": "application/json" }, body: '{"title":"X"}' })).status).toBe(403);
    const response = await request("/api/openai/conversations", {}, {
      "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "x-conversation-token",
    }, "OPTIONS");
    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe(origin);
    expect(response.headers.get("access-control-allow-origin")).not.toBe("*");
  });
  it("rejects oversized, invalid and compressed bodies without spending AI or decoding anonymous audio", async () => {
    expect((await request("/api/openai/conversations", { title: "x".repeat(33_000) })).status).toBe(413);
    const path = `/api/openai/conversations/${publicId}/voice-messages`;
    expect((await request(path, { audio: "A".repeat(3_200_000) })).status).toBe(401);
    expect((await request(path, { audio: "A".repeat(3_200_000) }, { "X-Conversation-Token": token })).status).toBe(413);
    expect((await request(path, { audio: "AAAA" }, { "X-Conversation-Token": token })).status).toBe(400);
    expect((await request("/api/openai/conversations", {}, { "Content-Encoding": "gzip" })).status).toBe(415);
    expect(state.voice).not.toHaveBeenCalled();
    expect(state.complete).not.toHaveBeenCalled();
  });
  it("fails closed when the shared limits or ownership store are unavailable", async () => {
    state.quota.mockRejectedValueOnce(new AbuseLimitError(120));
    const limited = await request("/api/openai/conversations", { title: "X" });
    expect(limited.status).toBe(429); expect(limited.headers.get("retry-after")).toBe("120");
    state.quota.mockRejectedValueOnce(new Error("store unavailable"));
    expect((await request("/api/openai/conversations", { title: "X" })).status).toBe(503);
    state.broken = true;
    expect((await request(`/api/openai/conversations/${publicId}/messages`, { content: "hello" }, { "X-Conversation-Token": token })).status).toBe(503);
    expect(state.complete).not.toHaveBeenCalled();
  });
  it("constant-time admin login rejects malformed values and honors throttling", async () => {
    for (const password of ["wrong", "", {}, null]) expect((await request("/api/auth", { password })).status).toBe(401);
    expect((await request("/api/auth", { password: admin })).status).toBe(200);
    state.quota.mockRejectedValueOnce(new AbuseLimitError());
    expect((await request("/api/auth", { password: admin })).status).toBe(429);
  });
});
