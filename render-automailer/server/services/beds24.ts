/**
 * Beds24 API v2 client (single property, long-life refresh token).
 *
 * Responsibilities:
 *  - Exchange the long-life refresh token for short-lived access tokens (cached).
 *  - Read room types + commercial policy for the configured property.
 *  - Produce an availability + pricing quote for a stay using the Beds24 *offers*
 *    (rate-plan) endpoint, so prices match the public Beds24 booking page exactly
 *    (offer base price × the property's bookingPageMultiplier, then rounded the
 *    same way Beds24 rounds).
 *  - Mirror the property's deposit + cancellation rules (deposit %, near-arrival
 *    and exceptional-period overrides) so the deposit taken matches Beds24.
 *  - Re-check availability immediately before confirming (double-booking guard).
 *  - Create a confirmed booking after payment is verified.
 *
 * IMPORTANT: prices/availability are always read live from Beds24 and never
 * trusted from the browser. The HTTP shapes below follow the Beds24 v2 docs;
 * parsing is defensive because the live payloads can carry extra fields.
 */

import { getBookingConfig, type BookingConfig } from '../config/booking-config';

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
  total: number; // guest-facing total for the whole stay (base × multiplier, rounded)
}

export interface RoomOffers {
  roomId: string;
  name: string;
  maxPeople: number;
  available: boolean;
  nights: number;
  currency: string;
  offers: RoomOffer[];
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

/** Parse the property bookingPageMultiplier (e.g. "*1.10") into a numeric factor. */
function parseMultiplier(raw: unknown): number | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  if (s.startsWith('*')) {
    const n = parseFloat(s.slice(1));
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  const n = parseFloat(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export class Beds24Service {
  private cfg: BookingConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt = 0; // epoch ms
  private currency: string;

  // Property cache (refreshed lazily, ~5 min TTL).
  private propertyLoadedAt = 0;
  private rooms: Beds24Room[] = [];
  private priceMultiplier = 1;
  private priceRounding: 'nearestOne' | 'twoDecimals' = 'twoDecimals';
  private depositPolicy: DepositPolicy | null = null;

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

  // ─── Auth ──────────────────────────────────────────────────────────────────

  private async getAccessToken(): Promise<string> {
    if (!this.cfg.beds24RefreshToken) {
      throw new Beds24Error('Beds24 is not configured (missing BEDS24_REFRESH_TOKEN)', 503);
    }
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60_000) {
      return this.accessToken;
    }

    const res = await fetch(`${this.cfg.beds24ApiBase}/authentication/token`, {
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
    const res = await fetch(`${this.cfg.beds24ApiBase}${path}`, {
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

    // Booking-page price markup (matches the public Beds24 booking page).
    const fromProp = parseMultiplier(property.bookingPageMultiplier);
    const fromEnv = parseMultiplier(process.env.BOOKING_PRICE_MULTIPLIER);
    this.priceMultiplier = fromProp ?? fromEnv ?? 1.1;

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

  // ─── Pricing helpers ───────────────────────────────────────────────────────

  /** Apply the booking-page multiplier and round the way the property rounds. */
  private toGuestPrice(basePrice: number): number {
    const marked = basePrice * this.priceMultiplier;
    if (this.priceRounding === 'nearestOne') return Math.round(marked);
    return Math.round((marked + Number.EPSILON) * 100) / 100;
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

  async getAvailability(input: {
    checkIn: string; checkOut: string; adults: number; children: number;
  }): Promise<AvailabilityResult> {
    const { checkIn, checkOut, adults, children } = input;
    const nights = nightsBetween(checkIn, checkOut);
    if (nights === 0) throw new Beds24Error('Checkout must be after checkin', 400);

    await this.loadProperty();
    const party = adults + children;
    const offersByRoom = await this.fetchOffers(input);

    const rooms: RoomOffers[] = this.rooms.map((room) => {
      const raw = (offersByRoom[room.roomId] || []).filter((o) => o.unitsAvailable >= 1);
      const offers: RoomOffer[] = raw
        .map((o) => {
          const type = offerTypeFromName(o.offerName);
          return {
            offerId: o.offerId,
            offerName: o.offerName,
            type,
            refundable: type !== 'nonRef',
            total: this.toGuestPrice(o.price),
          };
        })
        .filter((o) => o.total > 0)
        .sort((a, b) => a.total - b.total);

      return {
        roomId: room.roomId,
        name: room.name,
        maxPeople: room.maxPeople,
        available: room.maxPeople >= party && offers.length > 0,
        nights,
        currency: this.currency,
        offers,
      };
    });

    return { checkIn, checkOut, nights, adults, children, currency: this.currency, rooms };
  }

  /** Offers for a single room (used at checkout / webhook re-pricing). */
  async getRoomOffers(input: {
    roomId: string; checkIn: string; checkOut: string; adults: number; children: number;
  }): Promise<RoomOffers | null> {
    const result = await this.getAvailability(input);
    return result.rooms.find((r) => r.roomId === input.roomId) || null;
  }

  // ─── Booking creation ────────────────────────────────────────────────────

  async createConfirmedBooking(input: {
    roomId: string;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
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
  }): Promise<{ beds24BookingId: string }> {
    const booking: any = {
      roomId: Number(input.roomId),
      status: 'confirmed',
      arrival: input.checkIn,
      departure: input.checkOut,
      numAdult: input.adults,
      numChild: input.children,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone || '',
      country2: (input.country || '').toUpperCase().slice(0, 2),
      price: input.total,
      referer: 'Direct Website',
      notes: input.notes ||
        `Direct website booking${input.offerName ? ` (${input.offerName})` : ''}. ` +
        `Deposit paid ${input.deposit} ${input.currency}, ` +
        `balance due on arrival ${input.balance} ${input.currency}.`,
      invoiceItems: [
        {
          type: 'charge',
          description: `Accommodation ${input.checkIn} → ${input.checkOut}`,
          qty: 1,
          amount: input.total,
        },
        {
          type: 'payment',
          description: 'Deposit (Stripe)',
          amount: input.deposit,
        },
      ],
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
}
