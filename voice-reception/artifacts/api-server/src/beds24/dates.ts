const lodgeCalendar = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Africa/Maputo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Today's calendar date at the lodge, independent of the server timezone. */
export function getLodgeToday(now = new Date()): string {
  const parts = lodgeCalendar.formatToParts(now);
  return ["year", "month", "day"]
    .map((type) => parts.find((part) => part.type === type)!.value)
    .join("-");
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** MM-DD deliberately preserves the fact that the guest did not supply a year. */
export function isAvailabilityDate(value: string): boolean {
  return isIsoDate(value) ||
    (/^\d{2}-\d{2}$/.test(value) && isIsoDate(`2000-${value}`));
}

function nextOccurrence(monthDay: string, from: string, strictlyAfter = false): string | null {
  const firstYear = Number(from.slice(0, 4));
  // Eight years covers even the leap-day gap across a non-leap century.
  for (let year = firstYear; year <= Math.min(firstYear + 8, 9999); year++) {
    const candidate = `${String(year).padStart(4, "0")}-${monthDay}`;
    if (isIsoDate(candidate) && (strictlyAfter ? candidate > from : candidate >= from)) {
      return candidate;
    }
  }
  return null;
}

/**
 * Resolve omitted years on the server. Explicit years are never rewritten.
 * Checkout without a year follows arrival, including December/January stays.
 */
export function resolveAvailabilityDates(
  checkIn: string,
  checkOut: string,
  now = new Date(),
): { checkIn: string; checkOut: string } | null {
  if (!isAvailabilityDate(checkIn) || !isAvailabilityDate(checkOut)) return null;
  const arrival = checkIn.length === 5
    ? nextOccurrence(checkIn, getLodgeToday(now))
    : checkIn;
  if (!arrival) return null;
  const departure = checkOut.length === 5
    ? nextOccurrence(checkOut, arrival, true)
    : checkOut;
  return departure ? { checkIn: arrival, checkOut: departure } : null;
}
