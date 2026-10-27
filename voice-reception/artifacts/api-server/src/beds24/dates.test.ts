import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getLodgeToday, isAvailabilityDate, resolveAvailabilityDates } from "./dates";
import { validateToolArguments } from "../security/tools";

afterEach(() => vi.useRealTimers());

const october = new Date("2026-10-27T10:00:00Z");

describe("nearest upcoming booking dates", () => {
  it("uses the Mozambique calendar even before UTC midnight", () => {
    expect(getLodgeToday(new Date("2026-12-31T22:30:00Z"))).toBe("2027-01-01");
    expect(resolveAvailabilityDates("12-31", "01-02", new Date("2026-12-31T22:30:00Z")))
      .toEqual({ checkIn: "2027-12-31", checkOut: "2028-01-02" });
  });

  it.each([
    ["2026-10-12T21:10:00Z", "07-22", "07-24", "2027-07-22", "2027-07-24"],
    ["2026-10-26T09:25:00Z", "02-27", "03-05", "2027-02-27", "2027-03-05"],
    ["2026-10-26T09:25:00Z", "02-27", "03-06", "2027-02-27", "2027-03-06"],
    ["2026-10-27T10:00:00Z", "11-10", "11-12", "2026-11-10", "2026-11-12"],
    ["2026-10-27T10:00:00Z", "10-27", "10-28", "2026-10-27", "2026-10-28"],
    ["2026-12-15T10:00:00Z", "12-30", "01-03", "2026-12-30", "2027-01-03"],
    ["2027-01-02T10:00:00Z", "12-30", "01-03", "2027-12-30", "2028-01-03"],
    ["2026-10-27T10:00:00Z", "02-29", "03-02", "2028-02-29", "2028-03-02"],
    ["2097-01-01T10:00:00Z", "02-29", "03-02", "2104-02-29", "2104-03-02"],
    ["2040-10-27T10:00:00Z", "07-22", "07-24", "2041-07-22", "2041-07-24"],
  ])("resolves %s: %s–%s to the nearest upcoming stay", (now, checkIn, checkOut, arrival, departure) => {
    expect(resolveAvailabilityDates(checkIn, checkOut, new Date(now)))
      .toEqual({ checkIn: arrival, checkOut: departure });
  });

  it("never changes an explicit year, even if it is in the past", () => {
    expect(resolveAvailabilityDates("2026-07-22", "2026-07-24", october))
      .toEqual({ checkIn: "2026-07-22", checkOut: "2026-07-24" });
    expect(resolveAvailabilityDates("2028-07-22", "2028-07-24", october))
      .toEqual({ checkIn: "2028-07-22", checkOut: "2028-07-24" });
  });

  it("resolves a yearless checkout relative to an explicitly dated arrival", () => {
    expect(resolveAvailabilityDates("2027-12-30", "01-03", october))
      .toEqual({ checkIn: "2027-12-30", checkOut: "2028-01-03" });
  });

  it.each(["02-30", "04-31", "13-01", "00-10", "7-22", "July 22", "2026-02-29", "2027-04-31"])(
    "rejects invalid or unsupported date input %s", (invalid) => {
      expect(isAvailabilityDate(invalid)).toBe(false);
      expect(resolveAvailabilityDates(invalid, "03-02", october)).toBeNull();
    },
  );
});

describe("validated date-tool contract", () => {
  const validate = (args: Record<string, unknown>) =>
    validateToolArguments("check_availability", JSON.stringify(args));

  it("sends canonical full dates downstream and preserves occupancy", () => {
    vi.useFakeTimers();
    vi.setSystemTime(october);
    expect(validate({ checkIn: "02-27", checkOut: "03-05", numAdults: 3 }))
      .toMatchObject({
        ok: true,
        args: { checkIn: "2027-02-27", checkOut: "2027-03-05", numAdults: 3, numChildren: 0, numInfants: 0 },
      });
  });

  it.each([
    { checkIn: "11-01", checkOut: "10-31" },
    { checkIn: "11-01", checkOut: "11-01" },
    { checkIn: "2026-11-04", checkOut: "2026-11-01" },
    { checkIn: "2026-11-01", checkOut: "2027-11-01" },
    { checkIn: "07-22", checkOut: "07-24", numAdults: 31 },
    { checkIn: "07-22", checkOut: "07-24", numChildren: -1 },
    { checkIn: "07-22", checkOut: "07-24", conversationId: 999 },
  ])("keeps date-range, occupancy and strict-object limits for %j", (args) => {
    vi.useFakeTimers();
    vi.setSystemTime(october);
    expect(validate(args).ok).toBe(false);
  });

  it("does not accept unresolved dates in saved booking enquiries", () => {
    expect(validateToolArguments("save_booking_enquiry", JSON.stringify({
      guestName: "Sample Guest", checkIn: "07-22", checkOut: "07-24",
    })).ok).toBe(false);
  });

  it("wires the shared prompt to the current lodge date without a hard-coded year", () => {
    const prompt = readFileSync(new URL("../routes/openai.ts", import.meta.url), "utf8");
    expect(prompt).toContain("const isoDate = getLodgeToday(now)");
    expect(prompt).toContain("nearest upcoming occurrence on or after ${isoDate}");
    expect(prompt).toContain("Pass MM-DD to check_availability rather than guessing a year");
    expect(prompt).toContain("${bookingDateContext}");
    expect(prompt).not.toMatch(/the current year is \d{4}/);
    expect(prompt).toContain("These are rejected inputs, NOT evidence of a disconnected booking system");
  });
});
