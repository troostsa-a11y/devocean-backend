/**
 * Beds24 v2 calendar restrictions, separate from local rate calculation.
 * API schema: https://beds24.com/api/v2/apiV2.yaml (calendar, room schemas).
 */
export interface CalendarEntry {
  numAvail?: number;
  closed: boolean;
  minStay?: number;
  maxStay?: number;
  override: 'none' | 'blackout' | 'exception' | 'noCheckIn' | 'noCheckOut' | 'noCheckInOrCheckOut';
}

export interface RoomRestrictions {
  minStay?: number;
  maxStay?: number;
  restrictionStrategy?: 'firstNight' | 'stayThrough';
}

export function stayLimit(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 365) {
    throw new Error('Invalid Beds24 stay restriction');
  }
  return n;
}

export function parseCalendarEntry(entry: any): CalendarEntry {
  if (!entry || typeof entry !== 'object') throw new Error('Invalid Beds24 calendar entry');
  const override = entry.override ?? 'none';
  if (!['none', 'blackout', 'exception', 'noCheckIn', 'noCheckOut', 'noCheckInOrCheckOut'].includes(override)) {
    throw new Error('Unknown Beds24 calendar override');
  }
  const numAvail = entry.numAvail == null ? undefined : Number(entry.numAvail);
  if (numAvail !== undefined && !Number.isInteger(numAvail)) throw new Error('Invalid Beds24 availability');
  return {
    numAvail, closed: entry.closed === true, override,
    minStay: stayLimit(entry.minStay), maxStay: stayLimit(entry.maxStay),
  };
}

/**
 * Return bookable units, or zero for a definitive restriction.
 * Missing data throws: callers must treat this as an upstream failure, not as
 * a sold-out booking (particularly after payment, when Stripe should retry).
 * Departure-day stock, blackout and stay limits do NOT consume a sleep night.
 */
export function calendarUnitsForStay(
  calendar: Map<string, CalendarEntry>,
  stayDates: string[],
  checkOut: string,
  room: RoomRestrictions,
  exceptionIsBlackout = false,
): number {
  if (!stayDates.length) return 0;
  const required = [...stayDates, checkOut];
  for (const date of required) {
    if (!calendar.has(date)) throw new Error('Incomplete Beds24 calendar window');
  }
  const arrival = calendar.get(stayDates[0])!;
  const departure = calendar.get(checkOut)!;
  if (['noCheckIn', 'noCheckInOrCheckOut'].includes(arrival.override)) return 0;
  if (['noCheckOut', 'noCheckInOrCheckOut'].includes(departure.override)) return 0;

  const nights = stayDates.length;
  if (room.minStay !== undefined && nights < room.minStay) return 0;
  if (room.maxStay !== undefined && nights > room.maxStay) return 0;
  let units = Infinity;
  for (let i = 0; i < stayDates.length; i++) {
    const entry = calendar.get(stayDates[i])!;
    if (entry.closed || entry.override === 'blackout') return 0;
    if (entry.override === 'exception' && exceptionIsBlackout) return 0;
    if (entry.numAvail !== undefined) units = Math.min(units, entry.numAvail);
    if (i === 0 || room.restrictionStrategy !== 'firstNight') {
      if (entry.minStay !== undefined && nights < entry.minStay) return 0;
      if (entry.maxStay !== undefined && nights > entry.maxStay) return 0;
    }
  }
  // Existing conservative stock fallback, only after restriction data is read.
  return Number.isFinite(units) ? Math.max(0, units) : 1;
}