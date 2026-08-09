/**
 * Season-based pricing configuration.
 *
 * Beds24 is consulted ONLY for availability (numAvail per date).
 * All prices are computed locally from the settings in this file.
 *
 * ─── To update rates ────────────────────────────────────────────────────────
 * Change ROOM_RATES. Each room has:
 *   shoulder   — nightly base rate for 1 adult in shoulder season (USD)
 *   extraAdult — extra charge per additional adult per night
 *   extraChild — extra charge per child (extra bed, 4–12yr) per night;
 *                set to 0 if extra beds are not available for this room type
 *
 * ─── To update seasons ──────────────────────────────────────────────────────
 * Change SEASON_RANGES. Ranges are MM-DD (annual recurring). First match wins.
 * Ranges that wrap the year-end (e.g. 12-20 → 01-05) are supported natively.
 * For once-off dates (e.g. Easter), use full YYYY-MM-DD strings.
 *
 * ─── Season multipliers ─────────────────────────────────────────────────────
 * Applied to the shoulder rate to derive the price for every other season.
 * Change here if the relative pricing between seasons changes.
 *
 * ─── To update offer discounts / min-stay rules ─────────────────────────────
 * See OFFER_PLANS in beds24.ts.
 */

export type SeasonType = 'special' | 'low' | 'shoulder' | 'high' | 'peak';

// --------------------------------------------------------------------------
// Season multipliers (relative to shoulder = 100%)
// --------------------------------------------------------------------------
export const SEASON_MULTIPLIERS: Record<SeasonType, number> = {
  special:  0.85,
  low:      0.93,
  shoulder: 1.00,
  high:     1.18,
  peak:     1.38,
};

// --------------------------------------------------------------------------
// Per-room rate configuration
// Key = Beds24 roomId (string).
// ⚠️  TODO: replace placeholder room IDs (SAFARI_ID etc.) with real Beds24 room IDs.
//     Real IDs are visible in the Beds24 dashboard (Settings → Rooms) or in the
//     /api/booking/availability response once the service is live.
// --------------------------------------------------------------------------
export interface RoomRates {
  /** Nightly base rate for 1 adult in shoulder season (USD). */
  shoulder: number;
  /** Extra charge per additional adult per night (above 1 adult base). */
  extraAdult: number;
  /** Extra charge per child (4–12yr, extra bed) per night. 0 = not available. */
  extraChild: number;
}

export const ROOM_RATES: Record<string, RoomRates> = {
  // Four Safari Tents – shared bathrooms (Beds24 ID 620542)
  '620542': { shoulder: 52, extraAdult: 27, extraChild: 27 },
  // Three Comfort Safari Tents – private en-suite bathroom (Beds24 ID 620540)
  '620540': { shoulder: 67, extraAdult: 32, extraChild: 32 },
  // Garden Cottage – AC inverter, no extra bed (Beds24 ID 620541)
  '620541': { shoulder: 82, extraAdult: 37, extraChild:  0 },
  // Thatched Chalet – AC inverter (Beds24 ID 620543)
  '620543': { shoulder: 91, extraAdult: 38, extraChild: 40 },
};

// --------------------------------------------------------------------------
// Season date ranges (annual, recurring)
// --------------------------------------------------------------------------
export interface SeasonRange {
  type: SeasonType;
  /** First day of season — 'MM-DD' (annual) or 'YYYY-MM-DD' (specific year). */
  from: string;
  /** Last day of season — same format as `from`. Wrapping past Dec 31 OK. */
  to: string;
}

// ⚠️  TODO: fill in actual season dates.
export const SEASON_RANGES: SeasonRange[] = [
  // Listed in priority order: first matching range wins.
  // { type: 'peak',    from: '12-20', to: '01-05' },  // Christmas / New Year (wraps year)
  // { type: 'high',    from: '07-01', to: '08-31' },
  // { type: 'low',     from: '05-01', to: '06-30' },
  // { type: 'special', from: '04-14', to: '04-21' },  // Easter (adjust annually)
  // Shoulder is the fallback — no entry needed.
];

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

/**
 * Determine which season a specific date (YYYY-MM-DD) falls in.
 * Returns 'shoulder' if no range matches.
 */
export function getSeasonForDate(date: string): SeasonType {
  for (const range of SEASON_RANGES) {
    const isAnnual = range.from.length === 5; // MM-DD
    if (isAnnual) {
      const md = date.slice(5); // YYYY-MM-DD → MM-DD
      if (range.from <= range.to) {
        if (md >= range.from && md <= range.to) return range.type;
      } else {
        // Wrapping range (e.g. 12-20 → 01-05)
        if (md >= range.from || md <= range.to) return range.type;
      }
    } else {
      if (date >= range.from && date <= range.to) return range.type;
    }
  }
  return 'shoulder';
}

/**
 * Nightly master rate for a room on a given date (season-adjusted).
 * Returns 0 if the room is not configured in ROOM_RATES.
 */
export function getNightlyRate(roomId: string, date: string): number {
  const rates = ROOM_RATES[roomId];
  if (!rates) return 0;
  return rates.shoulder * SEASON_MULTIPLIERS[getSeasonForDate(date)];
}

/**
 * Extra adult charge per night for a room.
 * Returns 0 if the room is not configured.
 */
export function getExtraAdultRate(roomId: string): number {
  return ROOM_RATES[roomId]?.extraAdult ?? 0;
}

/**
 * Extra child charge per night for a room (0 = extra beds not available).
 */
export function getExtraChildRate(roomId: string): number {
  return ROOM_RATES[roomId]?.extraChild ?? 0;
}
