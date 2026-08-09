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
// Schedule coverage window
// --------------------------------------------------------------------------
// Dates outside this window have no season data and return rate 0 (= no offers).
// Extend SCHEDULE_END when new season data arrives.
export const SCHEDULE_START = '2026-08-07';
export const SCHEDULE_END   = '2028-01-15';

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

// Specific-year ranges (YYYY-MM-DD). Shoulder is the fallback — not listed here.
// Source: operator season schedule, Aug 2026 – Jan 2028.
export const SEASON_RANGES: SeasonRange[] = [
  // ── 2026 ────────────────────────────────────────────────────────────────────
  { type: 'high',    from: '2026-08-07', to: '2026-08-10' },
  { type: 'low',     from: '2026-08-11', to: '2026-08-13' },
  { type: 'low',     from: '2026-08-16', to: '2026-08-20' },
  { type: 'low',     from: '2026-08-23', to: '2026-08-27' },
  { type: 'low',     from: '2026-08-30', to: '2026-09-03' },
  { type: 'high',    from: '2026-09-04', to: '2026-09-07' },
  { type: 'low',     from: '2026-09-08', to: '2026-09-10' },
  { type: 'low',     from: '2026-09-13', to: '2026-09-17' },
  { type: 'low',     from: '2026-09-20', to: '2026-09-23' },
  { type: 'high',    from: '2026-09-24', to: '2026-10-05' },
  { type: 'low',     from: '2026-10-06', to: '2026-10-08' },
  { type: 'low',     from: '2026-10-11', to: '2026-10-15' },
  { type: 'low',     from: '2026-10-18', to: '2026-10-22' },
  { type: 'low',     from: '2026-10-25', to: '2026-10-29' },
  { type: 'special', from: '2026-11-01', to: '2026-11-05' },
  { type: 'special', from: '2026-11-08', to: '2026-11-12' },
  { type: 'special', from: '2026-11-15', to: '2026-11-19' },
  { type: 'special', from: '2026-11-22', to: '2026-11-26' },
  { type: 'special', from: '2026-11-29', to: '2026-11-30' },
  { type: 'high',    from: '2026-12-10', to: '2026-12-19' },
  { type: 'peak',    from: '2026-12-20', to: '2026-12-31' },

  // ── 2027 ────────────────────────────────────────────────────────────────────
  { type: 'peak',    from: '2027-01-01', to: '2027-01-05' },
  { type: 'high',    from: '2027-01-06', to: '2027-01-12' },
  { type: 'low',     from: '2027-01-13', to: '2027-01-14' },
  { type: 'low',     from: '2027-01-17', to: '2027-01-21' },
  { type: 'low',     from: '2027-01-24', to: '2027-01-28' },
  { type: 'low',     from: '2027-01-31', to: '2027-01-31' },
  { type: 'special', from: '2027-02-01', to: '2027-02-04' },
  { type: 'special', from: '2027-02-07', to: '2027-02-11' },
  { type: 'special', from: '2027-02-14', to: '2027-02-18' },
  { type: 'special', from: '2027-02-21', to: '2027-02-25' },
  { type: 'special', from: '2027-02-28', to: '2027-02-28' },
  { type: 'high',    from: '2027-03-20', to: '2027-03-24' },
  { type: 'peak',    from: '2027-03-25', to: '2027-03-29' },
  { type: 'high',    from: '2027-03-30', to: '2027-04-05' },
  { type: 'low',     from: '2027-04-06', to: '2027-04-08' },
  { type: 'low',     from: '2027-04-11', to: '2027-04-15' },
  { type: 'low',     from: '2027-04-18', to: '2027-04-22' },
  { type: 'high',    from: '2027-04-24', to: '2027-04-27' },
  { type: 'low',     from: '2027-04-28', to: '2027-04-29' },
  { type: 'special', from: '2027-05-02', to: '2027-05-06' },
  { type: 'special', from: '2027-05-09', to: '2027-05-13' },
  { type: 'special', from: '2027-05-16', to: '2027-05-20' },
  { type: 'special', from: '2027-05-23', to: '2027-05-27' },
  { type: 'special', from: '2027-05-30', to: '2027-06-03' },
  { type: 'special', from: '2027-06-06', to: '2027-06-10' },
  { type: 'low',     from: '2027-06-13', to: '2027-06-14' },
  { type: 'low',     from: '2027-06-17', to: '2027-06-17' },
  { type: 'low',     from: '2027-06-20', to: '2027-06-24' },
  { type: 'high',    from: '2027-06-25', to: '2027-07-19' },
  { type: 'low',     from: '2027-07-20', to: '2027-07-22' },
  { type: 'low',     from: '2027-07-25', to: '2027-07-29' },
  { type: 'low',     from: '2027-08-01', to: '2027-08-05' },
  { type: 'high',    from: '2027-08-06', to: '2027-08-09' },
  { type: 'low',     from: '2027-08-10', to: '2027-08-12' },
  { type: 'low',     from: '2027-08-15', to: '2027-08-19' },
  { type: 'low',     from: '2027-08-22', to: '2027-08-26' },
  { type: 'low',     from: '2027-08-29', to: '2027-09-02' },
  { type: 'low',     from: '2027-09-05', to: '2027-09-09' },
  { type: 'low',     from: '2027-09-12', to: '2027-09-16' },
  { type: 'low',     from: '2027-09-19', to: '2027-09-22' },
  { type: 'high',    from: '2027-09-23', to: '2027-10-04' },
  { type: 'low',     from: '2027-10-05', to: '2027-10-07' },
  { type: 'low',     from: '2027-10-10', to: '2027-10-14' },
  { type: 'low',     from: '2027-10-17', to: '2027-10-21' },
  { type: 'low',     from: '2027-10-24', to: '2027-10-28' },
  { type: 'low',     from: '2027-10-31', to: '2027-10-31' },
  { type: 'special', from: '2027-11-01', to: '2027-11-04' },
  { type: 'special', from: '2027-11-07', to: '2027-11-11' },
  { type: 'special', from: '2027-11-14', to: '2027-11-18' },
  { type: 'special', from: '2027-11-21', to: '2027-11-25' },
  { type: 'special', from: '2027-11-28', to: '2027-11-30' },
  { type: 'high',    from: '2027-12-09', to: '2027-12-19' },
  { type: 'peak',    from: '2027-12-20', to: '2027-12-31' },

  // ── 2028 ────────────────────────────────────────────────────────────────────
  { type: 'peak',    from: '2028-01-01', to: '2028-01-04' },
  { type: 'high',    from: '2028-01-05', to: '2028-01-15' },
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
  if (date < SCHEDULE_START || date > SCHEDULE_END) return 0; // outside known schedule
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
