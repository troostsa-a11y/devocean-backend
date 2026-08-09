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

// ─── Per-offer price plan (read from /inventory/prices, kept in memory) ──────
interface OfferPlan {
  offerId: number;
  offerName: string;    // raw Beds24 plan name (used for booking records)
  type: OfferType;
  minStay: number;
  maxStay: number;
  offsetPercent: number; // e.g. -10 means 10% cheaper than the master rate
}

interface RoomPriceInfo {
  priceFor: number;    // base rate covers up to N persons
  extraPerson: number; // $ per extra adult per night (above priceFor)
  extraChild: number;  // $ per child per night
  plans: OfferPlan[];  // bookable offer plans (master excluded)
}

// Per-date data returned by /inventory/rooms/calendar
interface CalEntry { price1: number; numAvail: number | undefined; closed: boolean }

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

  // Per-room price plans, loaded from /inventory/prices (~30 min TTL).
  private pricePlans = new Map<string, RoomPriceInfo>();
  private pricesLoadedAt = 0;

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

  // ─── Price plans (/inventory/prices, ~30 min cache) ─────────────────────────

  /**
   * Load per-room price plans from Beds24's /inventory/prices endpoint and
   * cache them. Each room has one master plan (the base rate for N persons) and
   * several derived plans (same extra-person charges, % offset on the base).
   *
   * Only derived plans (linkedTo != null) become bookable offers; the master is
   * the price calculation foundation and is excluded from the offer list.
   */
  private async loadPrices(force = false): Promise<void> {
    const fresh = this.pricesLoadedAt > 0 && Date.now() - this.pricesLoadedAt < 30 * 60_000;
    if (!force && fresh && this.pricePlans.size > 0) return;

    await this.loadProperty();
    if (!this.rooms.length) return;

    const params = new URLSearchParams();
    params.set('propertyId', this.cfg.beds24PropId);
    for (const room of this.rooms) params.append('roomId[]', room.roomId);

    const json = await this.request(`/inventory/prices?${params.toString()}`);
    const data: any[] = Array.isArray(json?.data) ? json.data : [];

    // Group plans by roomId.
    const byRoom = new Map<string, any[]>();
    for (const p of data) {
      const rid = String(p?.roomId ?? p?.id ?? '');
      // Some API shapes nest prices inside a "prices" array per room entry.
      if (Array.isArray(p?.prices)) {
        const roomId = String(p?.roomId ?? p?.id ?? rid);
        if (!byRoom.has(roomId)) byRoom.set(roomId, []);
        for (const sub of p.prices) byRoom.get(roomId)!.push({ ...sub, roomId });
      } else if (rid) {
        if (!byRoom.has(rid)) byRoom.set(rid, []);
        byRoom.get(rid)!.push(p);
      }
    }

    this.pricePlans.clear();

    for (const room of this.rooms) {
      const plans = byRoom.get(room.roomId) ?? [];
      if (!plans.length) continue;

      // Master plan: no linkedTo (or linkedTo === 0/null/undefined). If none
      // detected, use the plan with the smallest numeric id as the master.
      const sorted = [...plans].sort((a, b) => Number(a.id ?? a.priceId ?? 0) - Number(b.id ?? b.priceId ?? 0));
      const master = sorted.find(p =>
        p.linkedTo == null || p.linkedTo === '' || Number(p.linkedTo) === 0
      ) ?? sorted[0];

      const priceFor  = Math.max(1, Number(master?.priceFor ?? master?.numPersons ?? 1) || 1);
      const extraPerson = Math.max(0, Number(master?.extraPerson ?? master?.personPrice ?? 0) || 0);
      const extraChild  = Math.max(0, Number(master?.extraChild  ?? master?.childPrice  ?? 0) || 0);

      // Bookable offer plans = all plans except the master.
      const masterId = master?.id ?? master?.priceId;
      const offerPlans: OfferPlan[] = plans
        .filter(p => (p.id ?? p.priceId) !== masterId)
        .map(p => ({
          offerId:       Number(p.offerId ?? p.offer ?? 0),
          offerName:     String(p.name ?? p.offerName ?? ''),
          type:          offerTypeFromName(String(p.name ?? p.offerName ?? '')),
          minStay:       Math.max(1, Number(p.minimumStay ?? p.minStay ?? 1) || 1),
          maxStay:       Math.max(1, Number(p.maximumStay ?? p.maxStay ?? 28) || 28),
          offsetPercent: Number(p.offsetPercent ?? p.percentageOffset ?? 0) || 0,
        }))
        .filter(p => p.offerId > 0);

      this.pricePlans.set(room.roomId, { priceFor, extraPerson, extraChild, plans: offerPlans });
    }

    this.pricesLoadedAt = Date.now();
  }

  // ─── Calendar window fetch (shared by availability + findNearestAvailable) ──

  /**
   * Fetch per-date data (price1, numAvail, closed) for every room from the
   * Beds24 calendar endpoint. Returns a Map keyed by roomId → date → CalEntry.
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
    params.set('startDate', startDate);
    params.set('endDate',   endDate);
    params.set('includePrices',   'true');
    params.set('includeNumAvail', 'true');

    const json  = await this.request(`/inventory/rooms/calendar?${params.toString()}`);
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
        const price1   = Number(entry?.price1);
        const numAvail = entry?.numAvail !== undefined ? Number(entry.numAvail) : undefined;
        const closed   = entry?.closed === true;
        roomMap.set(date, {
          price1:   Number.isFinite(price1) && price1 > 0 ? price1 : 0,
          numAvail,
          closed,
        });
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

  // ─── Per-offer price computation from calendar data ───────────────────────

  /**
   * Build RoomOffer[] from pre-fetched calendar data for one room.
   *
   * Pricing: baseTotal = Σ price1 per night. Each offer type applies its own
   * offsetPercent discount to the base, then the occupancy surcharge (extra
   * adults above priceFor + children) is added at the master flat rate.
   * This matches how Beds24 computes derived prices on the "linked plans" page.
   *
   * Offer filtering:
   *   - nights must satisfy the plan's minStay / maxStay
   *   - advance-booking windows from OFFER_ADVANCE_BOOKING are applied
   *   - the room must have numAvail > 0 on every night of the stay
   */
  private calcOffers(
    roomId:      string,
    nights:      number,
    nightlyData: CalEntry[],   // one entry per night in the stay, in order
    adults:      number,
    children:    number,
    checkIn:     string,
  ): { offers: RoomOffer[]; unitsAvailable: number } {
    const info = this.pricePlans.get(roomId);
    if (!info || !info.plans.length) return { offers: [], unitsAvailable: 0 };

    // Check availability: every night must be open and have units.
    if (nightlyData.some(e => e.closed)) return { offers: [], unitsAvailable: 0 };
    const unitsAvailable = nightlyData.reduce<number>((min, e) => {
      if (e.numAvail === undefined) return min;  // unknown → no constraint
      return Math.min(min, e.numAvail);
    }, Infinity);
    if (Number.isFinite(unitsAvailable) && unitsAvailable <= 0) {
      return { offers: [], unitsAvailable: 0 };
    }
    const finalUnits = Number.isFinite(unitsAvailable) ? Math.round(unitsAvailable) : 1;

    const baseTotal = nightlyData.reduce((s, e) => s + e.price1, 0);
    if (baseTotal <= 0) return { offers: [], unitsAvailable: 0 };

    // Occupancy surcharge: adults above priceFor + all children, per night.
    const extraAdults = Math.max(0, adults - info.priceFor);
    const surcharge   = (extraAdults * info.extraPerson + children * info.extraChild) * nights;

    const daysToArrival = nightsBetween(todayUTC(), checkIn);

    const offers: RoomOffer[] = info.plans
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
          offerId:          plan.offerId,
          offerName:        plan.offerName,
          type:             plan.type,
          refundable:       plan.type !== 'nonRef',
          total,
          unitsAvailable:   finalUnits,
        };
      })
      .filter(o => o.total > 0)
      .sort((a, b) => a.total - b.total);

    return { offers, unitsAvailable: finalUnits };
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
   * Two Beds24 calls total (both cached):
   *  1. loadProperty()  — room metadata, deposit policy (~5 min TTL)
   *  2. loadPrices()    — offer plans, extraPerson/extraChild per room (~30 min TTL)
   * Then ONE live call:
   *  3. fetchCalendarWindow(checkIn, lastNight) — price1 + numAvail per date
   *
   * Prices are computed locally from the calendar's master nightly rate (price1),
   * each plan's offsetPercent, and the occupancy surcharge. No per-occupancy
   * offers call is made.
   */
  async getAvailability(input: {
    checkIn: string; checkOut: string; adults: number; children: number;
  }): Promise<AvailabilityResult> {
    const { checkIn, checkOut, adults, children } = input;
    const nights = nightsBetween(checkIn, checkOut);
    if (nights === 0) throw new Beds24Error('Checkout must be after checkin', 400);

    await this.loadProperty();
    await this.loadPrices();

    // Fetch calendar for every night in the stay (checkOut is NOT a sleep night).
    const lastNight = new Date(new Date(`${checkOut}T00:00:00Z`).getTime() - 86_400_000)
      .toISOString().slice(0, 10);
    const calData = await this.fetchCalendarWindow(checkIn, lastNight);

    const stayDates = eachDateISO(checkIn, lastNight);

    const rooms: RoomOffers[] = this.rooms.map((room) => {
      const occ         = this.displayOccupancy(room, adults, children);
      const roomCal     = calData.get(room.roomId) ?? new Map<string, CalEntry>();
      const nightlyData = stayDates.map(d => roomCal.get(d) ?? { price1: 0, numAvail: 0, closed: true });

      const { offers, unitsAvailable } = this.calcOffers(
        room.roomId, nights, nightlyData, occ.adults, occ.children, checkIn,
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
   * Shares the same calendar fetch so parallel legs reuse the response.
   */
  async getPricedOffersByRoom(stay: {
    checkIn: string; checkOut: string; adults: number; children: number;
  }): Promise<Record<string, RoomOffer[]>> {
    const { checkIn, checkOut, adults, children } = stay;
    const nights = nightsBetween(checkIn, checkOut);
    if (nights === 0) return {};

    await this.loadProperty();
    await this.loadPrices();

    const lastNight = new Date(new Date(`${checkOut}T00:00:00Z`).getTime() - 86_400_000)
      .toISOString().slice(0, 10);
    const calData  = await this.fetchCalendarWindow(checkIn, lastNight);
    const stayDates = eachDateISO(checkIn, lastNight);

    const out: Record<string, RoomOffer[]> = {};
    for (const room of this.rooms) {
      const roomCal     = calData.get(room.roomId) ?? new Map<string, CalEntry>();
      const nightlyData = stayDates.map(d => roomCal.get(d) ?? { price1: 0, numAvail: 0, closed: true });
      out[room.roomId]  = this.calcOffers(
        room.roomId, nights, nightlyData, adults, children, checkIn,
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
   * Fetch the per-date price for every room over [startDate, endDate] via the
   * Beds24 calendar endpoint and reduce to the MINIMUM nightly base price
   * (price1) across rooms for each date — the cheapest room is a good proxy for
   * the "rate level" of that date. Closed dates and non-positive prices are
   * skipped. Values are raw Beds24 units; they are only ever compared relative
   * to one another to bucket dates into colour tiers (see PriceCalendarResult).
   *
   * Cached ~30 min per date-range (Beds24's own guidance is that the calendar
   * only needs polling every few hours).
   */
  async getPriceCalendar(input: { startDate: string; endDate: string }): Promise<PriceCalendarResult> {
    const { startDate, endDate } = input;
    const key = `${startDate}_${endDate}`;
    const cached = this.calendarCache.get(key);
    if (cached && Date.now() - cached.at < 30 * 60_000) return cached.data;

    await this.loadProperty();
    const prices: Record<string, number> = {};

    // Reuse fetchCalendarWindow so the calendar parsing logic lives in one place.
    const calData = await this.fetchCalendarWindow(startDate, endDate);

    // Record the cheapest positive price1 seen for a date across all rooms.
    // Skip closed and sold-out entries so the tier reflects the cheapest
    // *bookable* rate, not a phantom price on an unavailable room.
    for (const roomMap of calData.values()) {
      for (const [date, entry] of roomMap) {
        if (entry.closed) continue;
        if (entry.numAvail !== undefined && entry.numAvail <= 0) continue;
        if (entry.price1 <= 0) continue;
        const prev = prices[date];
        if (prev === undefined || entry.price1 < prev) prices[date] = entry.price1;
      }
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

    // A window starting at `ci` is available iff every one of its `nights`
    // nights has a positive price, is not closed, and has numAvail > 0.
    const windowOk = (ci: string): boolean => {
      for (let i = 0; i < nights; i++) {
        const d = shiftDate(ci, i);
        const e = roomCal.get(d);
        if (!e || e.closed || e.price1 <= 0) return false;
        if (e.numAvail !== undefined && e.numAvail <= 0) return false;
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
