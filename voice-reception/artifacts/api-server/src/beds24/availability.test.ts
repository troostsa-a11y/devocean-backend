import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("../lib/logger", () => ({ logger: { info: vi.fn(), warn: vi.fn() } }));
import { checkAvailability } from "./client";
import { formatGroupAvailability } from "./group";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.useRealTimers(); });
const room = (name: string, units: number, people = 3) => ({
  roomName: name, available: units > 0, unitsAvailable: units,
  maxAdults: 2, maxPeople: people, totalPrice: 200, currency: "USD",
});
const result = (adults: number, children: number, infants: number, rooms = [room("Safari", 2), room("Comfort", 1)]) =>
  JSON.parse(formatGroupAvailability({
    checkIn: "2026-09-25", checkOut: "2026-09-27", nights: 2,
    numAdults: adults, numChildren: children, numInfants: infants, offers: rooms,
  }));
describe("Group capacity", () => {
  it.each([3, 4, 5, 6])("finds a stock-respecting combination for %s adults", adults => {
    const data = result(adults, 0, 0);
    expect(data.groupCapacityPossible).toBe(true);
    for (const combination of data.suggestedCombinations) {
      for (const r of combination) expect(r.units).toBeLessThanOrEqual(r.room === "Safari" ? 2 : 1);
    }
    expect(JSON.stringify(data)).not.toContain("estimatedGroupTotal");
  });
  it("supports a mixed combination for 6 adults and 3 dependants", () => {
    const data = result(6, 2, 1);
    expect(data.groupCapacityPossible).toBe(true);
    expect(data.suggestedCombinations[0]).toHaveLength(2);
  });
  it("does not confuse inadequate capacity with sold out", () => {
    const data = result(6, 3, 0, [room("Cottage", 3, 2)]);
    expect(data.anyAvailable).toBe(true);
    expect(data.groupCapacityPossible).toBe(false);
  });
  it("does not treat infants as capacity-free", () => {
    expect(result(2, 0, 2, [room("Safari", 1)]).groupCapacityPossible).toBe(false);
  });
  it("handles sold out and missing capacity without inventing a combination", () => {
    expect(result(4, 0, 0, []).anyAvailable).toBe(false);
    expect(result(4, 0, 0, [{ ...room("Unknown", 3), maxPeople: 0 }]).groupCapacityPossible).toBe(false);
  });
});
function setupFetch() {
  vi.stubEnv("AUTOMAILER_URL", "https://booking.test");
  vi.stubEnv("ADMIN_API_KEY", "test-only");
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  return fetch;
}
const success = () => new Response(JSON.stringify({ nights: 2, rooms: [], currency: "USD" }));
describe("Availability transport", () => {
  it("retries a temporary 503 once and preserves occupancy", async () => {
    const fetch = setupFetch().mockResolvedValueOnce(new Response("", { status: 503 })).mockResolvedValueOnce(success());
    await checkAvailability("2026-09-25", "2026-09-27", 6, 2, 1);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toMatchObject({ adults: 6, children: 2, infants: 1 });
  });
  it("does not retry authentication errors", async () => {
    const fetch = setupFetch().mockResolvedValue(new Response("", { status: 401 }));
    await expect(checkAvailability("2026-09-25", "2026-09-27")).rejects.toMatchObject({ status: 401 });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("bounds retry count on network failure", async () => {
    const fetch = setupFetch().mockRejectedValue(new TypeError("network"));
    await expect(checkAvailability("2026-09-25", "2026-09-27")).rejects.toThrow("network");
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it("keeps the deadline active while reading the body", async () => {
    vi.useFakeTimers();
    const fetch = setupFetch().mockImplementation((_url, options) => Promise.resolve({
      ok: true,
      json: () => new Promise((_resolve, reject) => options.signal.addEventListener("abort",
        () => reject(new DOMException("Timed out", "AbortError")))),
    }));
    const check = expect(checkAvailability("2026-09-25", "2026-09-27")).rejects.toMatchObject({ status: 504 });
    await vi.advanceTimersByTimeAsync(30001);
    await check;
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it("rejects malformed responses rather than reporting sold out", async () => {
    setupFetch().mockResolvedValue(new Response('{"error":"unavailable"}'));
    await expect(checkAvailability("2026-09-25", "2026-09-27")).rejects.toThrow("Invalid availability");
  });
});