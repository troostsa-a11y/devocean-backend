/**
 * Season-based pricing configuration.
 *
 * Beds24 is consulted ONLY for availability (numAvail per date).
 * All prices are computed locally from the settings in this file.
 *
 * ─── To update rates ────────────────────────────────────────────────────────
 * Change ROOM_SHOULDER_RATES (one master nightly rate per room, for 1 person).
 * All other season rates are derived automatically via SEASON_MULTIPLIERS.
 *
 * ─── To update seasons ──────────────────────────────────────────────────────
 * Change SEASON_RANGES. Ranges are MM-DD (annual recurring). First match wins.
 * Ranges that wrap the year-end (e.g. 12-20 → 01-05) are supported natively.
 * For once-off dates (e.g. Easter), use full YYYY-MM-DD strings.
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
// Per-room master shoulder rate (USD/night, for PRICE_FOR_PERSONS persons)
// Key = Beds24 roomId (string). Value = nightly rate in USD.
// ⚠️  TODO: fill in actual shoulder rates — see README or ask admin.
// --------------------------------------------------------------------------
export const ROOM_SHOULDER_RATES: Record<string, number> = {
  // 'BEDS24_ROOM_ID': RATE,   ← format
  // Example (replace with real values):
  // '620542': 80,    // Safari Tent - shared bathrooms
  // '620543': 110,   // Thatched Chalet - AC
};

// --------------------------------------------------------------------------
// Occupancy pricing constants
// Base rate covers up to PRICE_FOR_PERSONS persons at no extra charge.
// Each additional adult or child costs an extra flat fee per night.
// --------------------------------------------------------------------------
/** Number of persons the base rate includes (extra charged above this). */
export const PRICE_FOR_PERSONS = 1;
/** USD per extra adult per night (above PRICE_FOR_PERSONS). */
export const EXTRA_PERSON_RATE = 27;
/** USD per child per night. */
export const EXTRA_CHILD_RATE  = 27;

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
  // { type: 'peak',     from: '12-20', to: '01-05' },  // Christmas / New Year (wraps year)
  // { type: 'high',     from: '07-01', to: '08-31' },
  // { type: 'low',      from: '05-01', to: '06-30' },
  // { type: 'special',  from: '04-14', to: '04-21' },  // Easter (adjust per year)
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
  // Support both 'MM-DD' (annual recurring) and 'YYYY-MM-DD' (specific year).
  for (const range of SEASON_RANGES) {
    const isAnnual = range.from.length === 5; // MM-DD
    if (isAnnual) {
      const md = date.slice(5); // YYYY-MM-DD → MM-DD
      if (range.from <= range.to) {
        if (md >= range.from && md <= range.to) return range.type;
      } else {
        // Wrapping range (e.g. 12-20 → 01-05): matches if in [from, 12-31] OR [01-01, to]
        if (md >= range.from || md <= range.to) return range.type;
      }
    } else {
      // Full YYYY-MM-DD range
      if (date >= range.from && date <= range.to) return range.type;
    }
  }
  return 'shoulder';
}

/**
 * Nightly master rate for a room on a given date.
 * Returns 0 if the room is not configured in ROOM_SHOULDER_RATES (→ no offers shown).
 */
export function getNightlyRate(roomId: string, date: string): number {
  const shoulder = ROOM_SHOULDER_RATES[roomId];
  if (!shoulder) return 0;
  return shoulder * SEASON_MULTIPLIERS[getSeasonForDate(date)];
}
