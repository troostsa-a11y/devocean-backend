import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  quota: vi.fn(), insert: vi.fn(), sendMail: vi.fn(), transportClose: vi.fn(), notify: vi.fn(),
}));
vi.mock("@workspace/db", async () => ({
  ...await import("@workspace/db/schema"),
  db: { insert: () => ({ values: (values: unknown) => {
    state.insert(values);
    return { returning: async () => [{ id: 7 }] };
  } }) },
}));
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
vi.mock("./abuse", async (original) => ({
  ...await original<typeof import("./abuse")>(), consumeLimits: state.quota,
}));
vi.mock("../lib/logger", () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock("nodemailer", () => ({ default: {
  createTransport: () => ({ sendMail: state.sendMail, close: state.transportClose }),
} }));
import { runTool } from "../beds24/tool";
import { AbuseLimitError } from "./abuse";

beforeEach(() => {
  vi.clearAllMocks();
  state.quota.mockResolvedValue(undefined); state.sendMail.mockResolvedValue(undefined);
  state.notify.mockResolvedValue({ ok: true });
  vi.stubGlobal("fetch", state.notify);
  for (const [key, value] of Object.entries({
    NOTIFY_SMTP_HOST: "smtp.example.test", NOTIFY_SMTP_USER: "test-user", NOTIFY_SMTP_PASS: "test-pass",
    NOTIFY_EMAIL_FROM: "from@example.test", NOTIFY_EMAIL_TO: "staff@example.test",
    MARIN_NOTIFY_WA_PHONE: "000000", MARIN_NOTIFY_WA_APIKEY: "test-key",
  })) vi.stubEnv(key, value);
});

describe("booking and notification tool boundary", () => {
  const context = { conversationId: 101, ip: "198.51.100.1" };
  const args = JSON.stringify({ guestName: "Sample Guest", guestEmail: "guest@example.test", guests: 2 });
  it("never executes a tool without an authorized server context", async () => {
    expect(JSON.parse(await runTool("save_booking_enquiry", args, undefined as any)).error).toBe("unauthorized");
    expect(state.insert).not.toHaveBeenCalled(); expect(state.sendMail).not.toHaveBeenCalled();
  });
  it("rejects arbitrary associations and notification-header injection before effects", async () => {
    for (const unsafe of [{ guestName: "Guest", conversationId: 999 }, { guestName: "Guest\r\nBcc: somebody@example.test" }]) {
      expect(JSON.parse(await runTool("save_booking_enquiry", JSON.stringify(unsafe), context)).error).toBe("bad_arguments");
    }
    expect(state.quota).not.toHaveBeenCalled(); expect(state.insert).not.toHaveBeenCalled();
  });
  it("reserves enquiry quotas before either the insert or outbound notification", async () => {
    state.quota.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new AbuseLimitError());
    expect(JSON.parse(await runTool("save_booking_enquiry", args, context)).error).toBe("rate_limited");
    expect(state.insert).not.toHaveBeenCalled(); expect(state.sendMail).not.toHaveBeenCalled();
    expect(state.notify).not.toHaveBeenCalled();
  });
  it("binds a permitted enquiry to the server-authorized ID and bounds notifications", async () => {
    expect(JSON.parse(await runTool("save_booking_enquiry", args, context)).success).toBe(true);
    expect(state.insert.mock.calls[0][0].conversationId).toBe(101);
    expect(state.quota).toHaveBeenCalledTimes(2);
    expect(state.sendMail).toHaveBeenCalledTimes(1); expect(state.notify).toHaveBeenCalledTimes(1);
    expect(state.sendMail.mock.calls[0][0].text).toContain("unverified guest input");
    expect(state.notify.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  });
  it("does not start side effects after client disconnect", async () => {
    const controller = new AbortController(); controller.abort();
    expect(JSON.parse(await runTool("save_booking_enquiry", args, { ...context, signal: controller.signal })).error).toBe("session_ended");
    expect(state.quota).not.toHaveBeenCalled(); expect(state.insert).not.toHaveBeenCalled();
  });
});
