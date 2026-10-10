import { EventEmitter } from "node:events";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type WebSocket from "ws";

const state = vi.hoisted(() => ({ sockets: [] as any[], tool: vi.fn(), saved: vi.fn() }));
vi.mock("ws", async () => {
  const { EventEmitter } = await import("node:events");
  class FakeSocket extends EventEmitter {
    static OPEN = 1; static CONNECTING = 0; static CLOSED = 3;
    readyState = 1;
    sent: any[] = [];
    constructor() { super(); state.sockets.push(this); }
    send(value: string) { this.sent.push(JSON.parse(value)); }
    close() { if (this.readyState === 3) return; this.readyState = 3; this.emit("close", 1000, Buffer.from("")); }
    terminate() { this.close(); }
  }
  return { default: FakeSocket };
});
vi.mock("../routes/openai", () => ({ buildSystemPrompt: () => "Trusted lodge instructions." }));
vi.mock("../beds24/tool", () => ({ lodgeTools: [], runTool: state.tool }));
vi.mock("@workspace/db", async () => ({
  ...await import("@workspace/db/schema"),
  withDbRetry: (fn: () => Promise<unknown>) => fn(),
  db: { insert: () => ({ values: (value: unknown) => { state.saved(value); return Promise.resolve(); } }) },
}));
vi.mock("../lib/logger", () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
import { handleRealtimeWs } from "../routes/openaiRealtimeRelay";

class Client extends EventEmitter {
  readyState = 1;
  sent: any[] = [];
  closeCode?: number;
  send(value: string) { this.sent.push(JSON.parse(value)); }
  close(code = 1000) { this.closeCode = code; this.readyState = 3; this.emit("close"); }
}
let client: Client, upstream: any;
beforeEach(() => {
  vi.useFakeTimers(); vi.stubEnv("OPENAI_API_KEY", "sk-synthetic-test");
  state.sockets.length = 0; vi.clearAllMocks();
  state.tool.mockResolvedValue('{"success":true}');
  client = new Client();
  handleRealtimeWs(client as unknown as WebSocket, "en", "USD", { conversationId: 101, ip: "198.51.100.1" });
  upstream = state.sockets[0]; upstream.emit("open");
});
afterEach(() => { if (client.readyState !== 3) client.close(); vi.useRealTimers(); vi.unstubAllEnvs(); });

describe("relay client boundary and bounded lifetime", () => {
  it("keeps the model, prompt, output budget and tools under server control", () => {
    const session = upstream.sent[0].session;
    expect(session.type).toBe("realtime"); expect(session.instructions).toBe("Trusted lodge instructions.");
    expect(session.max_output_tokens).toBe(1024); expect(session.parallel_tool_calls).toBe(false);
    expect(session.audio.input.turn_detection.type).toBe("server_vad");
    expect(client.sent[0].type).toBe("session.ready");
  });
  it("forwards only audio, not attacker-controlled session/tool/response commands", () => {
    const audio = { type: "input_audio_buffer.append", audio: "AAAAAA==" };
    client.emit("message", Buffer.from(JSON.stringify(audio)), false);
    expect(upstream.sent.at(-1)).toEqual(audio);
    const count = upstream.sent.length;
    client.emit("message", Buffer.from('{"type":"session.update","session":{"model":"expensive-model"}}'), false);
    expect(client.closeCode).toBe(1008); expect(upstream.sent).toHaveLength(count);
    expect(upstream.readyState).toBe(3);
  });
  it("requires playback to drain after generation before re-enabling VAD", () => {
    const event = (type: string) => upstream.emit("message", Buffer.from(JSON.stringify({ type })));
    event("response.created");
    expect(upstream.sent.at(-1).session.audio.input.turn_detection).toBeNull();
    event("response.done");
    expect(upstream.sent.at(-1).session.audio.input.turn_detection).toBeNull();
    client.emit("message", Buffer.from('{"type":"client.mia_playback_done"}'), false);
    expect(upstream.sent.at(-1).session.audio.input.turn_detection.type).toBe("server_vad");
  });
  it("uses the gateway-authorized conversation for model tools and saved transcripts", async () => {
    upstream.emit("message", Buffer.from(JSON.stringify({
      type: "response.output_item.added", item: { type: "function_call", call_id: "tool-1", name: "save_booking_enquiry" },
    })));
    upstream.emit("message", Buffer.from(JSON.stringify({
      type: "response.function_call_arguments.done", call_id: "tool-1", arguments: '{"guestName":"Sample Guest"}',
    })));
    await Promise.resolve(); await Promise.resolve();
    expect(state.tool.mock.calls[0][2]).toMatchObject({ conversationId: 101, ip: "198.51.100.1" });
    upstream.emit("message", Buffer.from(JSON.stringify({ type: "response.output_audio_transcript.delta", delta: "Safe transcript." })));
    upstream.emit("message", Buffer.from('{"type":"response.done"}'));
    expect(state.saved.mock.calls[0][0].conversationId).toBe(101);
  });
  it("terminates billable upstream work on disconnect and at the five-minute cap", () => {
    vi.advanceTimersByTime(5 * 60_000);
    expect(client.closeCode).toBe(1008); expect(upstream.readyState).toBe(3);
    expect(vi.getTimerCount()).toBe(0);
  });
});
