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
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.useRealTimers(); });
vi.mock("./abuse", async (original) => ({
  ...await original<typeof import("./abuse")>(), consumeLimits: state.quota,
}));
vi.mock("../lib/logger", () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock("nodemailer", () => ({ default: {
  createTransport: () => ({ sendMail: state.sendMail, close: state.transportClose }),
} }));
import { lodgeTools, runTool } from "../beds24/tool";
import { AbuseLimitError } from "./abuse";
import { logger } from "../lib/logger";

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

describe("availability dates and truthful failure messages", () => {
  const context = { conversationId: 101, ip: "198.51.100.1" };
  const upcoming = { checkIn: "2027-07-22", checkOut: "2027-07-24" };
  const call = (args: Record<string, unknown>) =>
    runTool("check_availability", JSON.stringify(args), context).then(JSON.parse);

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-27T10:00:00Z"));
    vi.stubEnv("AUTOMAILER_URL", "https://booking.example.test");
    vi.stubEnv("ADMIN_API_KEY", "test-only-booking-key");
    state.notify.mockResolvedValue(new Response(JSON.stringify({
      rooms: [], nights: 2, currency: "USD",
    })));
  });

  it.each([
    [{ checkIn: "07-22", checkOut: "07-24", numAdults: 5 }, "2027-07-22", "2027-07-24", 5],
    [{ checkIn: "02-27", checkOut: "03-05", numAdults: 3 }, "2027-02-27", "2027-03-05", 3],
  ])("resolves the reported yearless request before reaching the booking engine: %j", async (args, checkIn, checkOut, adults) => {
    const result = await call(args);
    expect(result.error).toBeUndefined();
    expect(state.notify).toHaveBeenCalledTimes(1);
    expect(JSON.parse(state.notify.mock.calls[0][1].body)).toEqual({
      checkIn, checkOut, adults, children: 0, infants: 0,
    });
    expect(state.insert).not.toHaveBeenCalled();
    expect(state.sendMail).not.toHaveBeenCalled();
  });

  it("clarifies an explicitly past year without rewriting it or contacting the engine", async () => {
    const result = await call({ checkIn: "2026-07-22", checkOut: "2026-07-24" });
    expect(result).toMatchObject({
      error: "past_dates", checkIn: "2026-07-22", checkOut: "2026-07-24", today: "2026-10-27",
    });
    expect(result.note).toContain("never silently change an explicit year");
    expect(state.notify).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(expect.objectContaining({
      conversationId: 101, reason: "past_dates", checkIn: "2026-07-22",
    }), "Availability request rejected");
  });

  it("does not mislabel malformed dates as an availability outage", async () => {
    const result = await call({ checkIn: "02-30", checkOut: "03-02" });
    expect(result.error).toBe("bad_arguments");
    expect(result.note).toContain("Invalid input does NOT mean live availability is unavailable");
    expect(state.quota).not.toHaveBeenCalled();
    expect(state.notify).not.toHaveBeenCalled();
  });

  it.each([400, 422])("labels a booking-engine %s as rejected input, not a lost connection", async (status) => {
    state.notify.mockResolvedValue(new Response('{"error":"Invalid stay"}', { status }));
    const result = await call(upcoming);
    expect(result.error).toBe("invalid_stay");
    expect(result.note).toContain("Do NOT describe a rejected request as an outage");
    expect(state.notify).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith(expect.objectContaining({
      conversationId: 101, reason: "invalid_stay", status, ...upcoming,
    }), "Availability request rejected");
  });

  it("still reports a real upstream failure honestly after the bounded retry", async () => {
    state.notify.mockResolvedValue(new Response("", { status: 503 }));
    expect((await call(upcoming)).error).toBe("availability_lookup_failed");
    expect(state.notify).toHaveBeenCalledTimes(2);
    expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({
      conversationId: 101, ...upcoming,
    }), "check_availability tool failed");
  });

  it("keeps a missing connection distinct from invalid dates", async () => {
    vi.stubEnv("AUTOMAILER_URL", "");
    expect((await call(upcoming)).error).toBe("live_availability_unavailable");
    expect(state.notify).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({
      conversationId: 101, reason: "not_configured",
    }), "Availability connection is not configured");
  });
});

describe("nearest-date tool authorization and guest agreement", () => {
  const context = { conversationId: 101, ip: "198.51.100.1" };
  const args = { checkIn: "2027-07-22", checkOut: "2027-07-24", guestAgreed: true };
  const call = (input: Record<string, unknown>, ctx = context) =>
    runTool("check_nearest_availability", JSON.stringify(input), ctx).then(JSON.parse);
  it("registers the tool in the shared text and voice tool list", () => {
    expect(lodgeTools.some((tool) => tool.function.name === "check_nearest_availability")).toBe(true);
  });
  it("requires an authorized conversation before any search", async () => {
    expect(JSON.parse(await runTool("check_nearest_availability", JSON.stringify(args), undefined as any)).error)
      .toBe("unauthorized");
    expect(state.notify).not.toHaveBeenCalled(); expect(state.quota).not.toHaveBeenCalled();
  });
  it("rejects a search without agreement before consuming quotas or calling the engine", async () => {
    expect((await call({ ...args, guestAgreed: false })).error).toBe("bad_arguments");
    expect(state.notify).not.toHaveBeenCalled(); expect(state.quota).not.toHaveBeenCalled();
  });
  it("uses the existing shared tool quota and never creates an enquiry", async () => {
    state.quota.mockRejectedValueOnce(new AbuseLimitError());
    expect((await call(args)).error).toBe("rate_limited");
    expect(state.notify).not.toHaveBeenCalled();
    expect(state.insert).not.toHaveBeenCalled(); expect(state.sendMail).not.toHaveBeenCalled();
  });
  it("offers the question on a normal sold-out lookup without automatically searching", async () => {
    vi.stubEnv("AUTOMAILER_URL", "https://booking.example.test");
    vi.stubEnv("ADMIN_API_KEY", "test-only-key");
    state.notify.mockResolvedValue(new Response('{"nights":2,"rooms":[]}'));
    const soldOut = JSON.parse(await runTool("check_availability", JSON.stringify({
      checkIn: args.checkIn, checkOut: args.checkOut,
    }), context));
    expect(soldOut.followUpQuestion).toBe("Would you like me to check for the nearest available date?");
    expect(state.notify).toHaveBeenCalledTimes(1);
    expect(state.notify.mock.calls[0][0]).toBe("https://booking.example.test/api/booking/availability");
    expect(state.insert).not.toHaveBeenCalled(); expect(state.sendMail).not.toHaveBeenCalled();
  });
});
