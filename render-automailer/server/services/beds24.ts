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

/** Map a Beds24 offer code (e.g. "DIR-SF-OFR") to a normalised category. */
function offerTypeFromName(name: string): OfferType {
  const code = (String(name).split('-')[1] || '').toUpperCase();
  switch (code) {
    case 'SF': return 'semiFlex';
    case 'NR': return 'nonRef';
    case 'MS': return 'minStay';
    case 'WS': return 'weekly';
    case 'EB': return 'earlyBird';
    case 'LM': return 'lastMinute';
    default: return 'standard';
  }
}

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
   * Deposit percentage for a specific offer: Last-minute and non-refundable
   * rate plans are always paid in full at booking (100%), regardless of the
   * arrival-date-based rule above. Every other offer type falls back to
   * `getDepositPercentForArrival`.
   */
  getDepositPercentForOffer(checkIn: string, type: OfferType): number {
    if (type === 'lastMinute' || type === 'nonRef') return 100;
    return this.getDepositPercentForArrival(checkIn);
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

  // ─── Availability via the offers (rate-plan) endpoint ──────────────────────

  /**
   * Fetch the Beds24 offers for every room of the property for the given stay.
   *
   * NOTE: the offers endpoint must be called WITHOUT a roomId — passing roomId
   * suppresses the `offers` array. We query once for all rooms and map by id.
   */
  private async fetchOffers(stay: {
    checkIn: string; checkOut: string; adults: number; children: number;
  }): Promise<Record<string, Array<{ offerId: number; offerName: string; price: number; unitsAvailable: number }>>> {
    const params = new URLSearchParams();
    params.set('propertyId', this.cfg.beds24PropId);
    params.set('arrival', stay.checkIn);
    params.set('departure', stay.checkOut);
    params.set('numAdults', String(stay.adults));
    params.set('numChildren', String(stay.children));

    const json = await this.request(`/inventory/rooms/offers?${params.toString()}`);
    const data: any[] = json?.data || [];

    const map: Record<string, Array<{ offerId: number; offerName: string; price: number; unitsAvailable: number }>> = {};
    for (const entry of data) {
      const roomId = String(entry.roomId ?? entry.id);
      const offers: any[] = Array.isArray(entry.offers) ? entry.offers : [];
      map[roomId] = offers
        .map((o) => ({
          offerId: Number(o.offerId),
          offerName: String(o.offerName ?? ''),
          price: Number(o.price),
          unitsAvailable: Number(o.unitsAvailable ?? o.unitsAvail ?? 1),
        }))
        .filter((o) => Number.isFinite(o.offerId) && Number.isFinite(o.price) && o.price > 0);
    }
    return map;
  }

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

  /** Map raw Beds24 offers → guest-facing RoomOffer[] (priced, sold-out dropped, cheapest first).
   *
   * NR (non-refundable) offers are included and shown as the cheaper option
   * alongside SF (semi-flexible). Deposit for NR is 100% upfront (same as LM);
   * the UI shows a "Rate conditions" link to the cancellation terms page.
   */
  private priceOffers(
    raw: Array<{ offerId: number; offerName: string; price: number; unitsAvailable: number }>,
  ): RoomOffer[] {
    return raw
      .filter((o) => o.unitsAvailable >= 1)
      .map((o) => {
        const type = offerTypeFromName(o.offerName);
        return {
          offerId: o.offerId,
          offerName: o.offerName,
          type,
          refundable: type !== 'nonRef',
          total: this.toGuestPrice(o.price),
          unitsAvailable: o.unitsAvailable,
        };
      })
      .filter((o) => o.total > 0)
      .sort((a, b) => a.total - b.total);
  }

  async getAvailability(input: {
    checkIn: string; checkOut: string; adults: number; children: number;
  }): Promise<AvailabilityResult> {
    const { checkIn, checkOut, adults, children } = input;
    const nights = nightsBetween(checkIn, checkOut);
    if (nights === 0) throw new Beds24Error('Checkout must be after checkin', 400);

    await this.loadProperty();

    // Price every room at the occupancy it would actually carry for this party
    // (min(party, room capacity)). A room smaller than the whole party is still
    // bookable — the cart splits guests across rooms — so availability is gated
    // on offers EXISTING, not on a single room fitting everyone. Rooms that share
    // the same per-unit occupancy are priced together with one offers call.
    const occByRoom = new Map<string, { adults: number; children: number }>();
    const distinct = new Map<string, { adults: number; children: number }>();
    for (const room of this.rooms) {
      const occ = this.displayOccupancy(room, adults, children);
      occByRoom.set(room.roomId, occ);
      distinct.set(`${occ.adults}_${occ.children}`, occ);
    }

    const offerMaps = new Map<string, Record<string, Array<{ offerId: number; offerName: string; price: number; unitsAvailable: number }>>>();
    for (const [key, occ] of distinct) {
      offerMaps.set(
        key,
        await this.fetchOffers({ checkIn, checkOut, adults: occ.adults, children: occ.children }),
      );
    }

    const rooms: RoomOffers[] = this.rooms.map((room) => {
      const occ = occByRoom.get(room.roomId)!;
      const map = offerMaps.get(`${occ.adults}_${occ.children}`) || {};
      const offers = this.priceOffers(map[room.roomId] || []);
      return {
        roomId: room.roomId,
        name: room.name,
        maxPeople: room.maxPeople,
        maxAdults: room.maxAdults,
        maxChildren: room.maxChildren,
        available: offers.length > 0,
        nights,
        currency: this.currency,
        offers,
        unitsAvailable: offers[0]?.unitsAvailable ?? 0,
      };
    });

    return { checkIn, checkOut, nights, adults, children, currency: this.currency, rooms };
  }

  /**
   * Priced offers per room for ONE specific occupancy — used by the cart quote
   * to price each distinct per-leg occupancy. Same RoomOffer shape as
   * getAvailability (toGuestPrice applied, sold-out offers dropped, cheapest first).
   */
  async getPricedOffersByRoom(stay: {
    checkIn: string; checkOut: string; adults: number; children: number;
  }): Promise<Record<string, RoomOffer[]>> {
    await this.loadProperty();
    const map = await this.fetchOffers(stay);
    const out: Record<string, RoomOffer[]> = {};
    for (const room of this.rooms) {
      out[room.roomId] = this.priceOffers(map[room.roomId] || []);
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

    if (this.rooms.length) {
      const params = new URLSearchParams();
      // Beds24 v2 expects the bracketed array key for repeated room ids.
      for (const room of this.rooms) params.append('roomId[]', room.roomId);
      params.set('startDate', startDate);
      params.set('endDate', endDate);
      params.set('includePrices', 'true');
      params.set('includeNumAvail', 'true');

      const json = await this.request(`/inventory/rooms/calendar?${params.toString()}`);
      const data: any[] = Array.isArray(json?.data) ? json.data : [];

      // Record the cheapest positive price1 seen for a date across all rooms.
      // Skip closed and sold-out (numAvail<=0) entries so the tier reflects the
      // cheapest *bookable* rate, not a phantom price on an unavailable room.
      // numAvail is only trusted when present (the from/to range shape may omit it).
      const consider = (date: string, entry: any) => {
        if (!date || !ISO_DATE_RE.test(date)) return;
        if (entry?.closed === true) return;
        if (entry?.numAvail !== undefined && Number(entry.numAvail) <= 0) return;
        const p = Number(entry?.price1);
        if (!Number.isFinite(p) || p <= 0) return;
        const prev = prices[date];
        if (prev === undefined || p < prev) prices[date] = p;
      };

      // Defensive parse: `calendar` may be a date-keyed object, an array of
      // per-day entries, or an array of inclusive { from, to } ranges.
      for (const roomEntry of data) {
        const cal = roomEntry?.calendar;
        if (!cal) continue;
        if (Array.isArray(cal)) {
          for (const e of cal) {
            if (e?.date) {
              consider(String(e.date), e);
            } else if (e?.from) {
              for (const d of eachDateISO(String(e.from), String(e.to || e.from))) consider(d, e);
            }
          }
        } else if (typeof cal === 'object') {
          for (const [date, e] of Object.entries(cal)) consider(date, e);
        }
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
   * Search forward from `fromDate` for the nearest check-in date at which the
   * given room is available for `nights` nights. Probes in parallel batches of
   * BATCH days, stopping on the first successful window.
   *
   * Typical case (1–2 blocked nights in a long stay): resolves in 1–2 batches.
   * Worst case (84-day horizon, 9 batches): all calls run in parallel per batch.
   */
  async findNearestAvailable(params: {
    roomId: string;
    fromDate: string;
    nights: number;
    adults: number;
    children: number;
  }): Promise<{ found: true; checkIn: string; checkOut: string } | { found: false }> {
    const { roomId, fromDate, nights, adults, children } = params;
    if (nights < 1) return { found: false };

    await this.loadProperty();

    const room = this.rooms.find((r) => r.roomId === roomId);
    if (!room) return { found: false };

    // Use the same per-room occupancy capping as getAvailability.
    const occ = this.displayOccupancy(room, adults, children);

    const shiftDate = (base: string, n: number): string => {
      const d = new Date(base + 'T12:00:00Z');
      d.setUTCDate(d.getUTCDate() + n);
      return d.toISOString().slice(0, 10);
    };

    const LOOKAHEAD = 84;   // 12 weeks forward
    const LOOKBACK = 21;    // 3 weeks back (closer matches first)
    const BATCH = 10;       // parallel calls per forward batch

    const probe = async (offset: number) => {
      const ci = shiftDate(fromDate, offset);
      const co = shiftDate(ci, nights);
      try {
        const map = await this.fetchOffers({ checkIn: ci, checkOut: co, adults: occ.adults, children: occ.children });
        const offers = map[roomId] || [];
        return { available: offers.some((o) => o.unitsAvailable >= 1), offset, checkIn: ci, checkOut: co };
      } catch {
        return { available: false, offset, checkIn: '', checkOut: '' };
      }
    };

    // Backward search: offsets -1 … -(min LOOKBACK, days since today)
    // Cap at today so we never suggest a past check-in.
    const todayStr = new Date().toISOString().slice(0, 10);
    const daysFromToday = Math.round(
      (new Date(fromDate + 'T12:00:00Z').getTime() - new Date(todayStr + 'T12:00:00Z').getTime()) / 86_400_000
    );
    const maxBack = Math.min(LOOKBACK, Math.max(0, daysFromToday - 1));
    const backOffsets = Array.from({ length: maxBack }, (_, i) => -(i + 1));
    const backResultsAll = await Promise.all(backOffsets.map(probe));
    // backResultsAll is ordered [-1, -2, -3, …]; .find() returns the first (closest) match.
    const bestBack = backResultsAll.find((r) => r.available) ?? null;

    // Forward search: offsets +1 … +LOOKAHEAD in batches of BATCH.
    // Stop as soon as we find something closer than the best backward result.
    let bestForward: { offset: number; checkIn: string; checkOut: string } | null = null;
    for (let start = 1; start <= LOOKAHEAD; start += BATCH) {
      const offsets = Array.from(
        { length: Math.min(BATCH, LOOKAHEAD - start + 1) },
        (_, i) => start + i,
      );
      const results = await Promise.all(offsets.map(probe));
      const first = results.find((r) => r.available);
      if (first) {
        bestForward = { offset: first.offset, checkIn: first.checkIn, checkOut: first.checkOut };
        break;
      }
    }

    // Return whichever direction is closest to the originally requested dates.
    if (!bestBack && !bestForward) return { found: false };
    if (bestBack && !bestForward) return { found: true, checkIn: bestBack.checkIn, checkOut: bestBack.checkOut };
    if (!bestBack && bestForward) return { found: true, checkIn: bestForward.checkIn, checkOut: bestForward.checkOut };
    // Both found — pick the one with the smaller absolute offset.
    const winner = Math.abs(bestBack!.offset) <= Math.abs(bestForward!.offset) ? bestBack! : bestForward!;
    return { found: true, checkIn: winner.checkIn, checkOut: winner.checkOut };
  }
}
