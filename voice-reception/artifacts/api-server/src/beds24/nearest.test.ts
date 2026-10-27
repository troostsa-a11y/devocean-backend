import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
vi.mock("../lib/logger", () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
import { nearestAvailabilityTool, runNearestAvailability } from "./nearest";
import { formatAvailabilityForModel, NEAREST_DATE_QUESTION, type AvailabilityResult } from "./client";
import { formatGroupAvailability } from "./group";
import { validateToolArguments } from "../security/tools";

const preferred = { checkIn: "2026-12-30", checkOut: "2027-01-03" };
const context = { conversationId: 101 };
const stay = { ...preferred, numAdults: 2, numChildren: 0, numInfants: 0, guestAgreed: true };
const room = (id: string, name: string, available = false, units = 1, requiredUnits = 1) => ({
  roomId: id, name, available, unitsAvailable: available ? units : 0,
  requiredUnits, capacityAvailable: available && units >= requiredUnits,
  maxAdults: 2, maxPeople: 3, currency: "USD",
  offers: available ? [{ total: 200, unitsAvailable: units }] : [],
});
const catalogue = (rooms = [room("safari", "Safari Tent"), room("comfort", "Comfort Tent")]) => ({
  ...preferred, nights: 4, adults: 2, children: 0, currency: "USD", rooms,
});
const found = (checkIn: string, checkOut: string) => ({ found: true, checkIn, checkOut });

type RequestOptions = { body: string; signal: AbortSignal; headers: Record<string, string> };
type BookingHandler = (body: Record<string, unknown>, options: RequestOptions) => unknown;
let availability: Mock<BookingHandler>;
let nearest: Mock<BookingHandler>;
let fetchMock: Mock<(url: string, options: RequestOptions) => Promise<Response>>;
const call = (args = stay) => runNearestAvailability(args, context).then(JSON.parse);

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-27T10:00:00Z"));
  vi.stubEnv("AUTOMAILER_URL", "https://booking.example.test");
  vi.stubEnv("ADMIN_API_KEY", "test-only-key");
  availability = vi.fn<BookingHandler>(() => catalogue());
  nearest = vi.fn<BookingHandler>(() => ({ found: false }));
  fetchMock = vi.fn(async (url, options) => {
    const body = JSON.parse(options.body);
    const handler = String(url).endsWith("/nearest-available") ? nearest : availability;
    const data = await handler(body, options);
    return data instanceof Response ? data : new Response(JSON.stringify(data));
  });
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("nearest-date search through the booking engine", () => {
  it("chooses the closest of all room types on either side, then verifies it", async () => {
    nearest.mockImplementation(({ roomId }) => roomId === "safari"
      ? found("2027-01-01", "2027-01-05") : found("2026-12-29", "2027-01-02"));
    availability.mockImplementation(({ checkIn }) => checkIn === preferred.checkIn
      ? catalogue() : catalogue([room("comfort", "Comfort Tent", true)]));
    const result = await call();
    expect(result).toMatchObject({
      found: true, checkIn: "2026-12-29", checkOut: "2027-01-02", nights: 4, searchComplete: true,
    });
    expect(nearest).toHaveBeenCalledTimes(2);
    expect(nearest.mock.calls.map(([body]) => body)).toEqual([
      { roomId: "safari", fromDate: preferred.checkIn, nights: 4, adults: 2, children: 0, infants: 0 },
      { roomId: "comfort", fromDate: preferred.checkIn, nights: 4, adults: 2, children: 0, infants: 0 },
    ]);
    expect(availability.mock.calls[1][0]).toMatchObject({
      checkIn: "2026-12-29", checkOut: "2027-01-02", adults: 2, children: 0, infants: 0,
    });
    expect(result.availability.rooms[0]).toMatchObject({ room: "Comfort Tent", totalPrice: 200, currency: "USD" });
    const url = new URL(result.bookingUrl);
    expect(url.pathname).toBe("/book-direct");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      checkIn: "2026-12-29", checkOut: "2027-01-02", adults: "2", children: "0", infants: "0",
    });
    expect(fetchMock.mock.calls.every(([url]) => String(url).startsWith("https://booking.example.test/api/booking/"))).toBe(true);
  });

  it("matches the booking page's earlier-date tie break across room types", async () => {
    nearest.mockImplementation(({ roomId }) => roomId === "safari"
      ? found("2026-12-31", "2027-01-04") : found("2026-12-29", "2027-01-02"));
    availability.mockImplementation(({ checkIn }) => checkIn === preferred.checkIn
      ? catalogue() : catalogue([room("comfort", "Comfort Tent", true)]));
    expect((await call()).checkIn).toBe("2026-12-29");
  });

  it("preserves the room preference and every adult/child/infant count without inventing a group quote", async () => {
    availability.mockImplementation(({ checkIn }) => checkIn === preferred.checkIn
      ? catalogue() : catalogue([room("safari", "Safari Tent", true, 3, 3)]));
    nearest.mockReturnValue(found("2026-12-31", "2027-01-04"));
    const result = await runNearestAvailability({
      ...stay, roomType: "safari_tent", numAdults: 3, numChildren: 2, numInfants: 1,
    }, context).then(JSON.parse);
    expect(nearest).toHaveBeenCalledTimes(1);
    expect(nearest.mock.calls[0][0]).toMatchObject({
      roomId: "safari", adults: 3, children: 2, infants: 1, nights: 4,
    });
    expect(availability.mock.calls.every(([body]) => body.adults === 3 && body.children === 2 && body.infants === 1)).toBe(true);
    expect(result).toMatchObject({ found: true, roomPreference: "safari_tent" });
    expect(result.availability.groupCapacityPossible).toBe(true);
    expect(result.availability.rooms[0]).not.toHaveProperty("totalPrice");
    expect(result.availability).not.toHaveProperty("estimatedGroupTotal");
    expect(result.note).toContain("not a confirmed group quote");
  });

  it("does not change dates if the preferred stay has become available", async () => {
    availability.mockReturnValue(catalogue([room("safari", "Safari Tent", true)]));
    expect(await call()).toMatchObject({
      found: true, preferredDatesNowAvailable: true, ...preferred,
    });
    expect(nearest).not.toHaveBeenCalled();
  });

  it("rejects a stale closest suggestion and checks the next candidate", async () => {
    nearest.mockImplementation(({ roomId }) => roomId === "safari"
      ? found("2026-12-31", "2027-01-04") : found("2027-01-01", "2027-01-05"));
    availability.mockImplementation(({ checkIn }) => checkIn === "2027-01-01"
      ? catalogue([room("comfort", "Comfort Tent", true)]) : catalogue());
    expect(await call()).toMatchObject({ found: true, checkIn: "2027-01-01" });
    expect(availability).toHaveBeenCalledTimes(3);
  });

  it("does not present any suggested dates when the live recheck finds them full", async () => {
    nearest.mockReturnValue(found("2026-12-31", "2027-01-04"));
    const result = await call();
    expect(result).toMatchObject({ found: false, reason: "availability_changed" });
    expect(result).not.toHaveProperty("bookingUrl");
    expect(result.note).toContain("Do not present them as available");
    expect(availability).toHaveBeenCalledTimes(2); // duplicate suggestions share one recheck
  });

  it("reports the bounded search window when no room type has a matching stay", async () => {
    expect(await call()).toMatchObject({
      found: false, reason: "no_matching_dates",
      searched: { daysBefore: 21, daysAfter: 84, excludesPast: true, roomTypes: ["Safari Tent", "Comfort Tent"] },
    });
  });

  it("never turns an upstream error into a sold-out result", async () => {
    nearest.mockImplementation(() => new Response("", { status: 503 }));
    const result = await call();
    expect(result.error).toBe("nearest_search_incomplete");
    expect(result).not.toHaveProperty("found");
  });

  it("labels a verified partial search honestly instead of claiming the global nearest date", async () => {
    nearest.mockImplementation(({ roomId }) => roomId === "safari"
      ? new Response("", { status: 503 }) : found("2026-12-29", "2027-01-02"));
    availability.mockImplementation(({ checkIn }) => checkIn === preferred.checkIn
      ? catalogue() : catalogue([room("comfort", "Comfort Tent", true)]));
    const result = await call();
    expect(result).toMatchObject({ found: true, searchComplete: false, checkIn: "2026-12-29" });
    expect(result.note).toContain("do not claim it is the closest across the whole lodge");
  });

  it("rejects suggestions in the past, even if an upstream response claims they are valid", async () => {
    nearest.mockReturnValue(found("2026-10-01", "2026-10-05"));
    expect((await call()).error).toBe("nearest_search_incomplete");
    expect(availability).toHaveBeenCalledTimes(1);
  });

  it("fails explicitly rather than inventing room IDs for an incomplete catalogue", async () => {
    availability.mockReturnValue(catalogue([{ ...room("safari", "Safari Tent"), roomId: "" }]));
    expect((await call()).error).toBe("availability_lookup_failed");
    expect(nearest).not.toHaveBeenCalled();
  });

  it("does no lookup before guest agreement", async () => {
    expect(await runNearestAvailability({ ...stay, guestAgreed: false }, context).then(JSON.parse))
      .toMatchObject({ error: "consent_required" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not silently change an explicitly past year", async () => {
    expect(await runNearestAvailability({
      ...stay, checkIn: "2026-07-22", checkOut: "2026-07-26",
    }, context).then(JSON.parse)).toMatchObject({ error: "past_dates" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("stops in-flight lookups when the conversation ends", async () => {
    const controller = new AbortController();
    fetchMock.mockImplementation((_url, options) => new Promise<Response>((_resolve, reject) => {
      options.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    }));
    const pending = runNearestAvailability(stay, { ...context, signal: controller.signal });
    controller.abort();
    expect(await pending.then(JSON.parse)).toMatchObject({ error: "session_ended" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("offer first, search after agreement", () => {
  const full: AvailabilityResult = { ...preferred, nights: 4, numAdults: 2, offers: [] };
  it("adds the requested question to sold-out single and group responses", () => {
    const single = JSON.parse(formatAvailabilityForModel(full));
    const group = JSON.parse(formatGroupAvailability({ ...full, numAdults: 5 }));
    expect(single.followUpQuestion).toBe(NEAREST_DATE_QUESTION);
    expect(group.followUpQuestion).toBe(NEAREST_DATE_QUESTION);
    expect(single.note).toContain("STOP and wait");
    expect(group.note).toContain("STOP and wait");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([{}, { guestAgreed: false }, { guestAgreed: "true" }, { guestAgreed: true, roomType: "unknown" }])(
    "rejects absent or invalid consent/preferences before running a search: %j", (extra) => {
      expect(validateToolArguments("check_nearest_availability", JSON.stringify({ ...preferred, ...extra })).ok).toBe(false);
    },
  );

  it("shares strict future-date resolution and occupancy limits with the normal availability tool", () => {
    expect(validateToolArguments("check_nearest_availability", JSON.stringify({
      checkIn: "07-22", checkOut: "07-24", guestAgreed: true, numAdults: 5,
    }))).toMatchObject({
      ok: true, args: { checkIn: "2027-07-22", checkOut: "2027-07-24", numAdults: 5, roomType: "any" },
    });
    for (const extra of [{ numAdults: 31 }, { conversationId: 999 }, { url: "https://other.example.test" }]) {
      expect(validateToolArguments("check_nearest_availability", JSON.stringify({ ...stay, ...extra })).ok).toBe(false);
    }
  });

  it("makes the shared text/voice policy wait for agreement and reuse known details", () => {
    const prompt = readFileSync(new URL("../routes/openai.ts", import.meta.url), "utf8");
    expect(prompt).toContain(NEAREST_DATE_QUESTION);
    expect(prompt).toContain("Then STOP and wait for their answer");
    expect(prompt).toContain('a simple "yes", "oui" or equivalent');
    expect(prompt).toContain("do not ask again for known details");
    expect(nearestAvailabilityTool.function.parameters.required).toContain("guestAgreed");
  });
});
