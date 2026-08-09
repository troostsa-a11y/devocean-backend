/**
 * Beds24 API v2 client (single property, long-life refresh token).
 *
 * Responsibilities:
 *  - Exchange the long-life refresh token for short-lived access tokens (cached).
 *  - Read room types + commercial policy for the configured property.
 *  - Produce an availability + pricing quote for a stay using the Beds24 *offers*
 *    (rate-plan) endpoint, using the offer's base price as-is (rounded the same
 *    way Beds24 rounds). The property's `bookingPageMultiplier` is a Beds24-side
 *    OTA rate-parity tool (used to mark rates up on other channels) and must
 *    NOT be re-applied on top of the offer price here — doing so double-charges
 *    the guest on the direct-booking channel.
 *  - Mirror the property's deposit + cancellation rules (deposit %, near-arrival
 *    and exceptional-period overrides) so the deposit taken matches Beds24.
 *  - Re-check availability immediately before confirming (double-booking guard).
 *  - Create a confirmed booking after payment is verified.
 *
 * IMPORTANT: prices/availability are always read live from Beds24 and never
 * trusted from the browser. The HTTP shapes below follow the Beds24 v2 docs;
 * parsing is defensive because the live payloads can carry extra fields.
 */

import { getBookingConfig, round2, type BookingConfig } from '../config/booking-config';
import { getNightlyRate, getExtraAdultRate, getExtraChildRate } from '../config/season-config';

export interface Beds24Room {
  roomId: string;
  name: string;
  qty: number;
  maxPeople: number;
  maxAdults: number;
  maxChildren: number;
}

/** Normalised rate-plan category derived from the Beds24 offer code. */
export type OfferType =
  | 'standard'
  | 'semiFlex'
  | 'nonRef'
  | 'minStay'
  | 'weekly'
  | 'earlyBird'
  | 'lastMinute';

export interface RoomOffer {
  offerId: number;
  offerName: string; // raw Beds24 code, e.g. "DIR-SF-OFR" (kept for records)
  type: OfferType;
  refundable: boolean;
  total: number; // guest-facing total for the whole stay (base offer price, rounded)
  unitsAvailable: number; // physical rooms of this type still bookable (caps the cart qty)
}

export interface RoomOffers {
  roomId: string;
  name: string;
  maxPeople: number;
  maxAdults: number;
  maxChildren: number;
  available: boolean;
  nights: number;
  currency: string;
  offers: RoomOffer[];
  unitsAvailable: number; // units of the cheapest (auto-selected) offer; bounds the qty stepper
}

export interface AvailabilityResult {
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  currency: string;
  rooms: RoomOffers[];
}

export interface PriceCalendarResult {
  currency: string;
  startDate: string;
  endDate: string;
  /**
   * ISO date (YYYY-MM-DD) → minimum nightly base price (price1) across all rooms.
   * Raw Beds24 units — only the RELATIVE ordering matters (used to bucket dates
   * into rate-tier colours), so the booking-page multiplier/rounding is NOT
   * applied here (it would only collapse distinct rate levels, not reorder them).
   */
  prices: Record<string, number>;
}

interface DepositPolicy {
  normalPercent: number;       // deposit % for a normal booking
  nearPercent: number;         // deposit % when arrival is within nearDays
  nearDays: number;            // "booking near arrival" window in days
  exceptionalPercent: number;  // deposit % for arrivals in the exceptional period
  exceptionalStart?: string;   // YYYY-MM-DD
  exceptionalEnd?: string;     // YYYY-MM-DD
  cancellationDays: number;    // free cancellation up to N days before arrival
}

export class Beds24Error extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = 'Beds24Error';
    this.status = status;
  }
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(`${checkIn}T00:00:00Z`).getTime();
  const b = new Date(`${checkOut}T00:00:00Z`).getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Inclusive list of YYYY-MM-DD dates from start to end (capped for safety). */
function eachDateISO(start: string, end: string, cap = 800): string[] {
  const out: string[] = [];
  let t = new Date(`${start}T00:00:00Z`).getTime();
  const last = new Date(`${end}T00:00:00Z`).getTime();
  while (t <= last && out.length < cap) {
    out.push(new Date(t).toISOString().slice(0, 10));
    t += 86_400_000;
  }
  return out;
}

/**
 * Map a Beds24 offer/price-plan name to a normalised category.
 * Handles both legacy offer codes ("DIR-SF-OFR") and display names
 * returned by /inventory/prices ("Semi flexible", "Non refundable", …).
 */
function offerTypeFromName(name: string): OfferType {
  // Code-based match (legacy offers endpoint: "DIR-SF-OFR" → "SF")
  const code = (String(name).split('-')[1] || '').toUpperCase();
  switch (code) {
    case 'SF': return 'semiFlex';
    case 'NR': return 'nonRef';
    case 'MS': return 'minStay';
    case 'WS': return 'weekly';
    case 'EB': return 'earlyBird';
    case 'LM': return 'lastMinute';
  }
  // Display-name match (prices endpoint: "Semi flexible", "Minimum stay", …)
  const n = String(name).toLowerCase().replace(/[\s\-_]/g, '');
  if (n.includes('semiflex'))                             return 'semiFlex';
  if (n.includes('nonrefund') || n.includes('nonref'))   return 'nonRef';
  if (n.includes('minstay') || n.includes('minimumstay')) return 'minStay';
  if (n.includes('weekly') || n.includes('weekstay'))    return 'weekly';
  if (n.includes('earlybooker') || n.includes('earlybird') || n.includes('earlybook')) return 'earlyBird';
  if (n.includes('lastminute') || n.includes('lastmin')) return 'lastMinute';
  return 'standard';
}

// ─── Hardcoded advance-booking windows ───────────────────────────────────────
// These are property-level policy constants, defined once here rather than
// fetched per-request from Beds24. Update here if the lodge's policy changes.
//   nonRef    → available up to 28 days before arrival
//   earlyBird → must book at least 90 days before arrival
//   lastMinute → 3 days or fewer before arrival (no minimum)
const OFFER_ADVANCE_BOOKING: Partial<Record<OfferType, { minDays?: number; maxDays?: number }>> = {
  nonRef:     { maxDays: 28 },
  earlyBird:  { minDays: 90 },
  lastMinute: { maxDays: 3  },
};

// Per-date data returned by /inventory/rooms/calendar (availability only; pricing is local)
interface CalEntry { numAvail: number | undefined; closed: boolean }

// ─── Hardcoded offer plans ────────────────────────────────────────────────────
// offerId must match the corresponding Beds24 rate-plan id (sent on booking creation).
// Prices are computed locally in calcOffers(); the offerId is stored in Beds24 records only.
const OFFER_PLANS = [
  { offerId: 2, offerName: 'Semi flexible',  type: 'semiFlex'   as OfferType, minStay: 1, maxStay: 28, offsetPercent:   0 },
  { offerId: 3, offerName: 'Non refundable', type: 'nonRef'     as OfferType, minStay: 1, maxStay: 28, offsetPercent:  -8 },
  { offerId: 4, offerName: 'Minimum stay',   type: 'minStay'    as OfferType, minStay: 3, maxStay: 28, offsetPercent: -10 },
  { offerId: 5, offerName: 'Weekly stay',    type: 'weekly'     as OfferType, minStay: 7, maxStay: 28, offsetPercent: -15 },
  { offerId: 6, offerName: 'Early booker',   type: 'earlyBird'  as OfferType, minStay: 1, maxStay: 28, offsetPercent: -12 },
  { offerId: 7, offerName: 'Last minute',    type: 'lastMinute' as OfferType, minStay: 1, maxStay: 28, offsetPercent: -10 },
] as const;

export class Beds24Service {
  private cfg: BookingConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt = 0; // epoch ms
  private currency: string;

  // Property cache (refreshed lazily, ~5 min TTL).
  private propertyLoadedAt = 0;
  private rooms: Beds24Room[] = [];
  private priceRounding: 'nearestOne' | 'twoDecimals' = 'twoDecimals';
  private depositPolicy: DepositPolicy | null = null;

  // Price-calendar cache, keyed by `${startDate}_${endDate}` (~30 min TTL).
  private calendarCache = new Map<string, { at: number; data: PriceCalendarResult }>();


  constructor(cfg: BookingConfig = getBookingConfig()) {
    this.cfg = cfg;
    this.currency = cfg.currency;
  }

  get isConfigured(): boolean {
    return Boolean(this.cfg.beds24RefreshToken);
  }

  /** Currency reported by the property (falls back to configured currency). */
  getCurrency(): string {
    return this.currency;
  }

  /**
   * fetch() with a hard timeout. Beds24 is normally ~1.5s; without a ceiling a
   * stalled upstream would hang the whole /checkout handler until Cloudflare's
   * ~100s edge limit kills the request and the browser shows "Failed to fetch".
   * A bounded abort surfaces a clean, logged Beds24Error instead.
   */
  private async fetchWithTimeout(url: string, init: RequestInit, ms = 15_000): Promise<Response> {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), ms);
    try {
      return await fetch(url, { ...init, signal: ac.signal });
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        const rel = url.replace(this.cfg.beds24ApiBase, '');
        throw new Beds24Error(`Beds24 request timed out after ${ms}ms (${rel})`, 504);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  // ─── Auth ──────────────────────────────────────────────────────────────────

  private async getAccessToken(): Promise<string> {
    if (!this.cfg.beds24RefreshToken) {
      throw new Beds24Error('Beds24 is not configured (missing BEDS24_REFRESH_TOKEN)', 503);
    }
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60_000) {
      return this.accessToken;
    }

    const res = await this.fetchWithTimeout(`${this.cfg.beds24ApiBase}/authentication/token`, {
      method: 'GET',
      headers: { refreshToken: this.cfg.beds24RefreshToken, accept: 'application/json' },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Beds24Error(`Beds24 auth failed (${res.status}): ${body.slice(0, 200)}`, 502);
    }
    const json: any = await res.json();
    const token = json?.token;
    const expiresIn = Number(json?.expiresIn) || 86400; // seconds
    if (!token) throw new Beds24Error('Beds24 auth returned no token', 502);
    this.accessToken = token;
    this.tokenExpiresAt = Date.now() + expiresIn * 1000;
    return token;
  }

  private async request(path: string, init: RequestInit = {}, retry = true): Promise<any> {
    const token = await this.getAccessToken();
    const res = await this.fetchWithTimeout(`${this.cfg.beds24ApiBase}${path}`, {
      ...init,
      headers: {
        token,
        accept: 'application/json',
        ...(init.body ? { 'content-type': 'application/json' } : {}),
        ...(init.headers || {}),
      },
    });

    if (res.status === 401 && retry) {
      this.accessToken = null;
      this.tokenExpiresAt = 0;
      return this.request(path, init, false);
    }

    const text = await res.text();
    let json: any = null;
    try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON */ }

    if (!res.ok) {
      const msg = json?.error || json?.message || text.slice(0, 200) || `HTTP ${res.status}`;
      throw new Beds24Error(`Beds24 ${path} failed (${res.status}): ${msg}`, 502);
    }
    return json;
  }

  // ─── Property (rooms + commercial policy), cached ──────────────────────────

  private async loadProperty(force = false): Promise<void> {
    const fresh = this.propertyLoadedAt && Date.now() - this.propertyLoadedAt < 5 * 60_000;
    if (!force && fresh && this.rooms.length) return;

    const json = await this.request(
      `/properties?id=${encodeURIComponent(this.cfg.beds24PropId)}&includeAllRooms=true`,
    );
    const property = Array.isArray(json?.data) ? json.data[0] : json?.data;
    if (!property) throw new Beds24Error('Beds24 property not found', 502);

    if (property.currency) this.currency = String(property.currency).toUpperCase();

    this.priceRounding =
      String(property?.bookingRules?.priceRounding || '') === 'nearestOne'
        ? 'nearestOne'
        : 'twoDecimals';

    this.depositPolicy = this.parseDepositPolicy(property);

    const roomTypes: any[] = property?.roomTypes || property?.rooms || [];
    this.rooms = roomTypes.map((r) => ({
      roomId: String(r.id ?? r.roomId),
      name: String(r.name ?? `Room ${r.id ?? ''}`).trim(),
      qty: Number(r.qty ?? r.quantity ?? 1),
      maxPeople: Number(r.maxPeople ?? r.maxGuests ?? (Number(r.maxAdult ?? 2) + Number(r.maxChildren ?? 0))),
      maxAdults: Number(r.maxAdult ?? r.maxAdults ?? r.maxPeople ?? 2),
      maxChildren: Number(r.maxChildren ?? r.maxChild ?? 0),
    }));

    this.propertyLoadedAt = Date.now();
  }

  /** Derive the deposit + cancellation policy from the property settings. */
  private parseDepositPolicy(property: any): DepositPolicy {
    const pc = property?.paymentCollection || {};
    const br = property?.bookingRules || {};

    const pctOf = (slot: any, fallback: number): number => {
      const v = slot?.variableAmount;
      if (v && String(v.type) === 'percentage' && Number.isFinite(Number(v.percentageValue))) {
        return Number(v.percentageValue);
      }
      return fallback;
    };
    const deposit1 = pctOf(pc.depositPayment1, this.cfg.depositPercent); // typically 50
    const deposit2 = pctOf(pc.depositPayment2, 100);                     // typically 100

    // A bookingType string maps to which deposit slot applies.
    const depForType = (t: unknown): number => {
      switch (String(t || '')) {
        case 'confirmedWithDepositCollection2': return deposit2;
        case 'confirmedWithDepositCollection0': return 0;
        case 'confirmedWithDepositCollection1':
        default: return deposit1;
      }
    };

    return {
      normalPercent: depForType(br.bookingType || 'confirmedWithDepositCollection1'),
      nearPercent: depForType(br.bookingNearType),
      nearDays: Number(br.bookingNearTypeDays ?? 0) || 0,
      exceptionalPercent: depForType(br.bookingExceptionalType),
      exceptionalStart: br.bookingExceptionalTypeStart || undefined,
      exceptionalEnd: br.bookingExceptionalTypeEnd || undefined,
      cancellationDays:
        Number(br?.allowGuestCancellation?.daysBeforeArrivalValue ?? this.cfg.cancellationPolicyDays) ||
        this.cfg.cancellationPolicyDays,
    };
  }

  async getRooms(): Promise<Beds24Room[]> {
    await this.loadProperty();
    return this.rooms;
  }

  /** Free-cancellation window (days before arrival), mirrored from Beds24. */
  getCancellationDays(): number {
    return this.depositPolicy?.cancellationDays ?? this.cfg.cancellationPolicyDays;
  }

  /**
   * Deposit percentage for a given arrival date, mirroring Beds24:
   *  - 100% (or the configured "high" value) when arrival is within nearDays,
   *  - 100% for arrivals inside the exceptional period,
   *  - otherwise the normal deposit percentage (e.g. 50%).
   */
  getDepositPercentForArrival(checkIn: string): number {
    const p = this.depositPolicy;
    if (!p) return this.cfg.depositPercent;

    let pct = p.normalPercent;

    if (p.nearDays > 0) {
      const days = nightsBetween(todayUTC(), checkIn);
      if (days <= p.nearDays) pct = Math.max(pct, p.nearPercent);
    }
    if (p.exceptionalStart && p.exceptionalEnd &&
        checkIn >= p.exceptionalStart && checkIn <= p.exceptionalEnd) {
      pct = Math.max(pct, p.exceptionalPercent);
    }

    // Never below 1% — the flow always collects a deposit.
    return Math.min(100, Math.max(1, Math.round(pct)));
  }

  /**
   * Deposit percentage for a specific offer — three rules, full coverage:
   *  - LM (lastMinute) → 100%: full prepayment, no exceptions.
   *  - NR (nonRef)     → 100%: non-refundable, charged in full at booking.
   *  - All others (SF, standard, earlyBird, minStay, weekly, …) → normalPercent
   *    (typically 50%), balance due on arrival.
   *
   * The arrival-date-based uplift (`getDepositPercentForArrival`) is intentionally
   * NOT used here — rate type alone determines the deposit, never proximity to
   * arrival. LM rates already exist precisely to capture near-arrival bookings at
   * 100%; no other type should be silently uplifted.
   */
  getDepositPercentForOffer(_checkIn: string, type: OfferType): number {
    if (type === 'lastMinute' || type === 'nonRef') return 100;
    return Math.min(100, Math.max(1, Math.round(
      this.depositPolicy?.normalPercent ?? this.cfg.depositPercent
    )));
  }

  // ─── Pricing helpers ───────────────────────────────────────────────────────

  /**
   * Round the offer's base price the way the property rounds. The
   * `bookingPageMultiplier` is intentionally NOT applied here — it is a
   * Beds24-side OTA rate-parity setting, not a direct-booking markup.
   */
  private toGuestPrice(basePrice: number): number {
    if (this.priceRounding === 'nearestOne') return Math.round(basePrice);
    return Math.round((basePrice + Number.EPSILON) * 100) / 100;
  }

  // ─── Calendar window fetch (availability data from Beds24) ──────────────────

  /**
   * Fetch per-date availability data (numAvail, closed) for every room from
   * the Beds24 calendar endpoint. Pricing is NOT read from Beds24 — it is
   * computed locally from season-config.ts.
   *
   * Handles all three calendar shapes Beds24 may return: date-keyed object,
   * per-day array, or inclusive { from, to } range array.
   */
  private async fetchCalendarWindow(
    startDate: string,
    endDate:   string,
  ): Promise<Map<string, Map<string, CalEntry>>> {
    const result = new Map<string, Map<string, CalEntry>>();
    if (!this.rooms.length) return result;

    const params = new URLSearchParams();
    for (const room of this.rooms) params.append('roomId[]', room.roomId);
    params.set('startDate',       startDate);
    params.set('endDate',         endDate);
    params.set('includePrices',   'true');   // keep for Beds24 compatibility even though we don't use price1
    params.set('includeNumAvail', 'true');

    const json = await this.request(`/inventory/rooms/calendar?${params.toString()}`);
    const data: any[] = Array.isArray(json?.data) ? json.data : [];

    for (const roomEntry of data) {
      const roomId = String(roomEntry?.roomId ?? roomEntry?.id ?? '');
      if (!roomId) continue;
      const roomMap = new Map<string, CalEntry>();
      result.set(roomId, roomMap);

      const cal = roomEntry?.calendar;
      if (!cal) continue;

      const record = (date: string, entry: any) => {
        if (!date || !ISO_DATE_RE.test(date)) return;
        const numAvail = entry?.numAvail !== undefined ? Number(entry.numAvail) : undefined;
        const closed   = entry?.closed === true;
        roomMap.set(date, { numAvail, closed });
      };

      if (Array.isArray(cal)) {
        for (const e of cal) {
          if (e?.date) {
            record(String(e.date), e);
          } else if (e?.from) {
            for (const d of eachDateISO(String(e.from), String(e.to || e.from))) record(d, e);
          }
        }
      } else if (typeof cal === 'object') {
        for (const [date, e] of Object.entries(cal)) record(date, e as any);
      }
    }

    return result;
  }

  // ─── Local price computation (season config + hardcoded offer plans) ─────────

  /**
   * Build RoomOffer[] for one room from local season-based pricing.
   *
   * Pricing (Beds24 not involved):
   *   baseTotal = Σ getNightlyRate(roomId, date) for each night in the stay
   *   Each offer applies its offsetPercent discount to baseTotal, then adds
   *   the flat occupancy surcharge (extra adults + children × per-night rate).
   *
   * Availability gating:
   *   numAvail = minimum units available across all nights (from Beds24 calendar).
   *   0 or explicitly closed → no offers returned.
   */
  private calcOffers(
    roomId:    string,
    nights:    number,
    stayDates: string[], // YYYY-MM-DD for each night of the stay, in order
    numAvail:  number,   // pre-computed minimum units from Beds24 calendar
    adults:    number,
    children:  number,
    checkIn:   string,
  ): { offers: RoomOffer[]; unitsAvailable: number } {
    if (numAvail <= 0) return { offers: [], unitsAvailable: 0 };

    // Sum the locally-computed nightly master rate for each night of the stay.
    const baseTotal = stayDates.reduce((s, d) => s + getNightlyRate(roomId, d), 0);
    if (baseTotal <= 0) return { offers: [], unitsAvailable: 0 }; // room not in season config

    // Occupancy surcharge — billed by position, not by guest type:
    //   Slot 1 (anyone):          included in base rate
    //   Slot 2 (any age):         + extraAdult rate
    //   Slot 3 (child 4–12yr):    + extraChild rate
    //   Slot 3 (infant 0–3yr):    free — infants are never passed here
    //
    // `children` here is 4–12yr only; infants are stripped upstream and never
    // reach getAvailability, so `totalBillable = adults + children` is correct.
    const totalBillable = adults + children;
    const surcharge = (
      (totalBillable >= 2 ? getExtraAdultRate(roomId) : 0) +
      (totalBillable >= 3 ? getExtraChildRate(roomId) : 0)
    ) * nights;

    const daysToArrival = nightsBetween(todayUTC(), checkIn);

    const offers: RoomOffer[] = OFFER_PLANS
      .filter(plan => {
        if (nights < plan.minStay || nights > plan.maxStay) return false;
        const constraint = OFFER_ADVANCE_BOOKING[plan.type];
        if (constraint?.minDays !== undefined && daysToArrival < constraint.minDays) return false;
        if (constraint?.maxDays !== undefined && daysToArrival > constraint.maxDays) return false;
        return true;
      })
      .map(plan => {
        const discountedBase = baseTotal * (1 + plan.offsetPercent / 100);
        const total          = this.toGuestPrice(discountedBase + surcharge);
        return {
          offerId:        plan.offerId,
          offerName:      plan.offerName,
          type:           plan.type,
          refundable:     plan.type !== 'nonRef',
          total,
          unitsAvailable: numAvail,
        };
      })
      .filter(o => o.total > 0)
      .sort((a, b) => a.total - b.total);

    return { offers, unitsAvailable: numAvail };
  }

  /**
   * Extract the minimum available units across all stay dates from a room's calendar map.
   *
   * Beds24 calendar only stores EXPLICIT blocks/sold-out entries — dates with no
   * calendar entry at all are implicitly open. So:
   *   - No entry (!e)           → open (treat numAvail as unknown)
   *   - entry.closed === true   → unavailable (return 0 immediately)
   *   - entry.numAvail defined  → trust it; 0 = sold out
   *   - entry.numAvail absent   → open, qty unknown (don't constrain min)
   * If all dates are unknown-qty, return 1 (conservative: assume at least 1 unit).
   */
  private minUnitsAvailable(roomCal: Map<string, CalEntry>, stayDates: string[]): number {
    let min = Infinity;
    for (const d of stayDates) {
      const e = roomCal.get(d);
      if (e?.closed) return 0;                              // explicitly closed
      if (e?.numAvail !== undefined) min = Math.min(min, e.numAvail); // explicit qty
      // no entry or no numAvail field → date is implicitly open, no constraint
    }
    // If any date had numAvail=0, min is 0. If all were unconstrained, min=Infinity → 1.
    return Number.isFinite(min) ? Math.max(0, Math.round(min)) : 1;
  }

  // ─── Diagnostics ──────────────────────────────────────────────────────────

  /**
   * Returns the raw offer list from Beds24 /inventory/rooms/offers for a date range.
   * Used only by the admin /api/booking/debug-offers route to verify offerId mapping.
   */
  async debugOffers(checkIn: string, checkOut: string): Promise<any> {
    await this.loadProperty();
    const params = new URLSearchParams({
      propertyId: String(this.cfg.beds24PropId),
      checkIn,
      checkOut,
      numAdult: '2',
    });
    const json = await this.request(`/inventory/rooms/offers?${params.toString()}`);
    // Return raw data alongside our OFFER_PLANS for easy comparison.
    const ourPlans = [
      { offerId: 2, offerName: 'Semi flexible',  type: 'semiFlex'   },
      { offerId: 3, offerName: 'Non refundable', type: 'nonRef'     },
      { offerId: 4, offerName: 'Minimum stay',   type: 'minStay'    },
      { offerId: 5, offerName: 'Weekly stay',     type: 'weekly'     },
      { offerId: 6, offerName: 'Early booker',   type: 'earlyBird'  },
      { offerId: 7, offerName: 'Last minute',    type: 'lastMinute' },
    ];
    return { ourPlans, beds24Raw: json };
  }

  /**
   * Returns raw calendar data from Beds24 for a date range.
   * Used only by the admin /api/booking/debug-calendar route.
   */
  async debugCalendar(startDate: string, endDate: string): Promise<any> {
    await this.loadProperty();
    const calData = await this.fetchCalendarWindow(startDate, endDate);
    const rooms = this.rooms.map(r => ({ roomId: r.roomId, name: r.name }));
    const calendar: Record<string, any> = {};
    for (const [roomId, roomMap] of calData) {
      const entries = Object.fromEntries(roomMap);
      calendar[roomId] = { totalEntries: roomMap.size, entries };
    }
    return { rooms, calendarRoomIds: [...calData.keys()], calendar };
  }

  // ─── Availability ─────────────────────────────────────────────────────────

  /**
   * The occupancy a single unit of this room would carry for the given party:
   * fill the room toward the party (adults first, then children), capped by the
   * room's adult/child/total limits. This is what we price the room at — a room
   * smaller than the whole party is priced at "full", and the cart splits the
   * remaining guests across the other rooms.
   */
  private displayOccupancy(
    room: Beds24Room,
    adults: number,
    children: number,
  ): { adults: number; children: number } {
    const maxA = room.maxAdults > 0 ? room.maxAdults : room.maxPeople;
    const a = Math.max(1, Math.min(adults, maxA, room.maxPeople));
    const remaining = Math.max(0, room.maxPeople - a);
    const maxC = Number.isFinite(room.maxChildren) ? room.maxChildren : remaining;
    const c = Math.max(0, Math.min(children, maxC, remaining));
    return { adults: a, children: c };
  }

  /**
   * Availability + pricing for all rooms for a given stay.
   *
   * Beds24 calls:
   *  1. loadProperty() — room metadata, deposit policy (~5 min TTL, cached)
   *  2. fetchCalendarWindow(checkIn, lastNight) — numAvail per date per room (live)
   *
   * Pricing is 100% local: season-config.ts → getNightlyRate(roomId, date)
   * multiplied by each OFFER_PLAN's offsetPercent, plus the occupancy surcharge.
   */
  async getAvailability(input: {
    checkIn: string; checkOut: string; adults: number; children: number;
  }): Promise<AvailabilityResult> {
    const { checkIn, checkOut, adults, children } = input;
    const nights = nightsBetween(checkIn, checkOut);
    if (nights === 0) throw new Beds24Error('Checkout must be after checkin', 400);

    await this.loadProperty();

    // Fetch calendar for every night in the stay (checkOut is NOT a sleep night).
    const lastNight = new Date(new Date(`${checkOut}T00:00:00Z`).getTime() - 86_400_000)
      .toISOString().slice(0, 10);
    const calData   = await this.fetchCalendarWindow(checkIn, lastNight);
    const stayDates = eachDateISO(checkIn, lastNight);

    const rooms: RoomOffers[] = this.rooms.map((room) => {
      const occ      = this.displayOccupancy(room, adults, children);
      const roomCal  = calData.get(room.roomId) ?? new Map<string, CalEntry>();
      const numAvail = this.minUnitsAvailable(roomCal, stayDates);

      const { offers, unitsAvailable } = this.calcOffers(
        room.roomId, nights, stayDates, numAvail, occ.adults, occ.children, checkIn,
      );
      return {
        roomId:         room.roomId,
        name:           room.name,
        maxPeople:      room.maxPeople,
        maxAdults:      room.maxAdults,
        maxChildren:    room.maxChildren,
        available:      offers.length > 0,
        nights,
        currency:       this.currency,
        offers,
        unitsAvailable,
      };
    });

    return { checkIn, checkOut, nights, adults, children, currency: this.currency, rooms };
  }

  /**
   * Priced offers per room for ONE specific occupancy — used by the cart quote
   * to price each distinct per-leg occupancy. Same shape as getAvailability.
   */
  async getPricedOffersByRoom(stay: {
    checkIn: string; checkOut: string; adults: number; children: number;
  }): Promise<Record<string, RoomOffer[]>> {
    const { checkIn, checkOut, adults, children } = stay;
    const nights = nightsBetween(checkIn, checkOut);
    if (nights === 0) return {};

    await this.loadProperty();

    const lastNight = new Date(new Date(`${checkOut}T00:00:00Z`).getTime() - 86_400_000)
      .toISOString().slice(0, 10);
    const calData   = await this.fetchCalendarWindow(checkIn, lastNight);
    const stayDates = eachDateISO(checkIn, lastNight);

    const out: Record<string, RoomOffer[]> = {};
    for (const room of this.rooms) {
      const roomCal  = calData.get(room.roomId) ?? new Map<string, CalEntry>();
      const numAvail = this.minUnitsAvailable(roomCal, stayDates);
      out[room.roomId] = this.calcOffers(
        room.roomId, nights, stayDates, numAvail, adults, children, checkIn,
      ).offers;
    }
    return out;
  }

  /** Offers for a single room (used at checkout / webhook re-pricing). */
  async getRoomOffers(input: {
    roomId: string; checkIn: string; checkOut: string; adults: number; children: number;
  }): Promise<RoomOffers | null> {
    const result = await this.getAvailability(input);
    return result.rooms.find((r) => r.roomId === input.roomId) || null;
  }

  // ─── Per-date price calendar (rate-tier colouring for the picker) ──────────

  /**
   * Compute the per-date price for every room over [startDate, endDate] using
   * local season-based pricing (no Beds24 call needed — prices are deterministic).
   * Returns the MINIMUM nightly rate across rooms for each date, which is used
   * only for relative bucketing into colour tiers in the date picker.
   *
   * Cached for performance (the computation is O(n × rooms) but cheap).
   */
  async getPriceCalendar(input: { startDate: string; endDate: string }): Promise<PriceCalendarResult> {
    const { startDate, endDate } = input;
    const key = `${startDate}_${endDate}`;
    const cached = this.calendarCache.get(key);
    if (cached && Date.now() - cached.at < 30 * 60_000) return cached.data;

    await this.loadProperty();
    const prices: Record<string, number> = {};

    for (const date of eachDateISO(startDate, endDate)) {
      let minRate = Infinity;
      for (const room of this.rooms) {
        const rate = getNightlyRate(room.roomId, date);
        if (rate > 0 && rate < minRate) minRate = rate;
      }
      if (Number.isFinite(minRate) && minRate > 0) prices[date] = minRate;
    }

    const result: PriceCalendarResult = { currency: this.currency, startDate, endDate, prices };
    this.calendarCache.set(key, { at: Date.now(), data: result });
    return result;
  }

  // ─── Booking creation ────────────────────────────────────────────────────

  async createConfirmedBooking(input: {
    roomId: string;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    infants?: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    country?: string;
    total: number;
    deposit: number;
    balance: number;
    currency: string;
    offerId?: number | null;
    offerName?: string | null;
    notes?: string;
    bedType?: string;         // 'King' | 'Twin' — appended to booking notes
    discount?: number;
    couponCode?: string | null;
  }): Promise<{ beds24BookingId: string }> {
    // `total` here is the leg's GROSS accommodation price. When a coupon
    // applies, the guest-facing/Beds24 price is the NET amount (gross -
    // discount) and the discount is recorded as its own negative invoice line
    // so the property always sees exactly what was charged and why.
    const discount = input.discount && input.discount > 0 ? round2(input.discount) : 0;
    const netTotal = round2(input.total - discount);

    const invoiceItems: any[] = [
      {
        type: 'charge',
        description: `Accommodation ${input.checkIn} → ${input.checkOut}`,
        qty: 1,
        amount: input.total,
      },
    ];
    if (discount > 0) {
      invoiceItems.push({
        type: 'charge',
        description: `Discount: ${input.couponCode || 'COUPON'}`,
        qty: 1,
        amount: -discount,
      });
    }
    invoiceItems.push({
      type: 'payment',
      description: 'Deposit (Stripe)',
      amount: input.deposit,
    });

    const booking: any = {
      roomId: Number(input.roomId),
      status: 'confirmed',
      arrival: input.checkIn,
      departure: input.checkOut,
      numAdult: input.adults,
      numChild: input.children,
      numInfant: input.infants ?? 0,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone || '',
      country2: (input.country || '').toUpperCase().slice(0, 2),
      price: netTotal,
      referer: 'Direct Website',
      notes: input.notes ||
        `Direct website booking${input.offerName ? ` (${input.offerName})` : ''}.` +
        (input.bedType ? ` Bed preference: ${input.bedType}.` : '') +
        (discount > 0 ? ` Coupon ${input.couponCode || ''} applied: -${discount} ${input.currency}.` : '') +
        ` Deposit paid ${input.deposit} ${input.currency}, ` +
        `balance due on arrival ${input.balance} ${input.currency}.`,
      invoiceItems,
    };
    // Attach the chosen rate plan so Beds24 records the correct offer; the price
    // is still set explicitly above so the guest is charged the quoted amount.
    if (input.offerId != null && Number.isFinite(Number(input.offerId))) {
      booking.offerId = Number(input.offerId);
    }

    const json = await this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify([booking]),
    });

    const result = Array.isArray(json) ? json[0] : (json?.data ? json.data[0] : json);
    if (result && result.success === false) {
      const msg = result?.errors?.[0]?.message || result?.error || 'Beds24 rejected the booking';
      throw new Beds24Error(`Beds24 booking creation failed: ${msg}`, 502);
    }
    const id = result?.new?.id ?? result?.id ?? result?.bookId ?? result?.modified?.id;
    if (!id) {
      throw new Beds24Error('Beds24 booking creation returned no id', 502);
    }
    return { beds24BookingId: String(id) };
  }

  /**
   * Search bidirectionally from `fromDate` for the nearest check-in date at
   * which `roomId` has `nights` consecutive available nights.
   *
   * Previous approach: up to 84 separate /inventory/rooms/offers calls.
   * New approach: ONE /inventory/rooms/calendar call covering the full window,
   * then a local scan — no per-date round trips.
   */
  async findNearestAvailable(params: {
    roomId: string;
    fromDate: string;
    nights: number;
    adults: number;
    children: number;
  }): Promise<{ found: true; checkIn: string; checkOut: string } | { found: false }> {
    const { roomId, fromDate, nights } = params;
    if (nights < 1) return { found: false };

    await this.loadProperty();
    const room = this.rooms.find((r) => r.roomId === roomId);
    if (!room) return { found: false };

    const LOOKAHEAD = 84;  // 12 weeks forward
    const LOOKBACK  = 21;  // 3 weeks back

    const shiftDate = (base: string, n: number): string => {
      const d = new Date(`${base}T12:00:00Z`);
      d.setUTCDate(d.getUTCDate() + n);
      return d.toISOString().slice(0, 10);
    };

    const todayStr   = todayUTC();
    const rawStart   = shiftDate(fromDate, -LOOKBACK);
    const fetchStart = rawStart < todayStr ? todayStr : rawStart;
    // Need LOOKAHEAD nights of check-ins plus (nights-1) more to complete the
    // last window, so fetch to fromDate + LOOKAHEAD + nights.
    const fetchEnd = shiftDate(fromDate, LOOKAHEAD + nights);

    // ONE calendar fetch for the entire search window.
    const calData = await this.fetchCalendarWindow(fetchStart, fetchEnd);
    const roomCal = calData.get(roomId) ?? new Map<string, CalEntry>();

    // A window starting at `ci` is available iff every one of its `nights` nights:
    //   - is not explicitly closed in the Beds24 calendar
    //   - has numAvail > 0 when Beds24 specifies it (no entry = implicitly open)
    //   - has a configured local rate (room is in season-config.ts ROOM_RATES)
    const windowOk = (ci: string): boolean => {
      for (let i = 0; i < nights; i++) {
        const d = shiftDate(ci, i);
        const e = roomCal.get(d);
        if (e?.closed) return false;                                    // explicitly closed
        if (e?.numAvail !== undefined && e.numAvail <= 0) return false; // sold out
        if (getNightlyRate(roomId, d) <= 0) return false;               // room not in config
      }
      return true;
    };

    // Backward scan: offsets −1 … −maxBack (closest first).
    const daysFromToday = Math.round(
      (new Date(`${fromDate}T12:00:00Z`).getTime() -
       new Date(`${todayStr}T12:00:00Z`).getTime()) / 86_400_000,
    );
    const maxBack = Math.min(LOOKBACK, Math.max(0, daysFromToday - 1));
    let bestBack: { checkIn: string; offset: number } | null = null;
    for (let i = 1; i <= maxBack; i++) {
      const ci = shiftDate(fromDate, -i);
      if (windowOk(ci)) { bestBack = { checkIn: ci, offset: -i }; break; }
    }

    // Forward scan: offsets +1 … +LOOKAHEAD (closest first).
    let bestForward: { checkIn: string; offset: number } | null = null;
    for (let i = 1; i <= LOOKAHEAD; i++) {
      const ci = shiftDate(fromDate, i);
      if (windowOk(ci)) { bestForward = { checkIn: ci, offset: i }; break; }
    }

    if (!bestBack && !bestForward) return { found: false };
    if (bestBack  && !bestForward) return { found: true, checkIn: bestBack.checkIn,    checkOut: shiftDate(bestBack.checkIn,    nights) };
    if (!bestBack && bestForward)  return { found: true, checkIn: bestForward.checkIn, checkOut: shiftDate(bestForward.checkIn, nights) };
    const winner = Math.abs(bestBack!.offset) <= Math.abs(bestForward!.offset) ? bestBack! : bestForward!;
    return { found: true, checkIn: winner.checkIn, checkOut: shiftDate(winner.checkIn, nights) };
  }
}
