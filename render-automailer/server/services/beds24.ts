/**
 * Beds24 API v2 client (single property, long-life refresh token).
 *
 * Responsibilities:
 *  - Exchange the long-life refresh token for short-lived access tokens (cached).
 *  - Read room types for the configured property.
 *  - Produce an availability + pricing quote for a stay (prices come straight
 *    from Beds24 so the lodge's PMS remains the single source of truth).
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

export interface RoomQuote {
  roomId: string;
  name: string;
  maxPeople: number;
  available: boolean;
  nights: number;
  nightlyPrices: number[]; // one entry per night
  total: number;
  currency: string;
}

export interface QuoteResult {
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  currency: string;
  rooms: RoomQuote[];
}

export class Beds24Error extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = 'Beds24Error';
    this.status = status;
  }
}

function eachNight(checkIn: string, checkOut: string): string[] {
  const out: string[] = [];
  const start = new Date(`${checkIn}T00:00:00Z`);
  const end = new Date(`${checkOut}T00:00:00Z`);
  for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export class Beds24Service {
  private cfg: BookingConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt = 0; // epoch ms
  private currency: string;

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
    // Reuse cached token until ~60s before expiry.
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
      // Access token may have been revoked early; force a refresh once.
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

  // ─── Rooms ───────────────────────────────────────────────────────────────

  async getRooms(): Promise<Beds24Room[]> {
    const json = await this.request(
      `/properties?id=${encodeURIComponent(this.cfg.beds24PropId)}&includeAllRooms=true`,
    );
    const property = Array.isArray(json?.data) ? json.data[0] : json?.data;
    if (property?.currency) this.currency = String(property.currency).toUpperCase();

    const roomTypes: any[] = property?.roomTypes || property?.rooms || [];
    return roomTypes.map((r) => ({
      roomId: String(r.id ?? r.roomId),
      name: String(r.name ?? `Room ${r.id ?? ''}`).trim(),
      qty: Number(r.qty ?? r.quantity ?? 1),
      maxPeople: Number(r.maxPeople ?? r.maxGuests ?? (Number(r.maxAdult ?? 2) + Number(r.maxChildren ?? 0))),
      maxAdults: Number(r.maxAdult ?? r.maxAdults ?? r.maxPeople ?? 2),
      maxChildren: Number(r.maxChildren ?? r.maxChild ?? 0),
    }));
  }

  /**
   * Fetch the per-night availability + price map for a set of rooms.
   * Returns { [roomId]: { [date]: { numAvail, price } } }.
   */
  private async getCalendar(
    roomIds: string[],
    checkIn: string,
    checkOut: string,
  ): Promise<Record<string, Record<string, { numAvail: number; price: number }>>> {
    // Beds24 calendar `endDate` is inclusive of the last night, so query up to
    // the night before checkout.
    const nights = eachNight(checkIn, checkOut);
    const lastNight = nights[nights.length - 1] || checkIn;

    const params = new URLSearchParams();
    params.set('startDate', checkIn);
    params.set('endDate', lastNight);
    params.set('includeNumAvail', 'true');
    params.set('includePrices', 'true');
    roomIds.forEach((id) => params.append('roomId', id));

    const json = await this.request(`/inventory/rooms/calendar?${params.toString()}`);
    const data: any[] = json?.data || [];

    const map: Record<string, Record<string, { numAvail: number; price: number }>> = {};
    for (const entry of data) {
      const roomId = String(entry.roomId ?? entry.id);
      const dayMap: Record<string, { numAvail: number; price: number }> = {};
      const cal: any[] = entry.calendar || entry.days || [];
      for (const slot of cal) {
        const from = slot.from || slot.date;
        const to = slot.to || slot.from || slot.date;
        const numAvail = Number(slot.numAvail ?? slot.inventory ?? 0);
        const price = Number(slot.price1 ?? slot.price ?? slot.dailyPrice ?? 0);
        for (const day of eachNight(from, addDay(to))) {
          dayMap[day] = { numAvail, price };
        }
      }
      map[roomId] = dayMap;
    }
    return map;
  }

  // ─── Quote ─────────────────────────────────────────────────────────────────

  async getQuote(input: {
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
  }): Promise<QuoteResult> {
    const { checkIn, checkOut, adults, children } = input;
    const nights = eachNight(checkIn, checkOut);
    if (nights.length === 0) {
      throw new Beds24Error('Checkout must be after checkin', 400);
    }

    const rooms = await this.getRooms();
    const calendar = await this.getCalendar(rooms.map((r) => r.roomId), checkIn, checkOut);
    const party = adults + children;

    const roomQuotes: RoomQuote[] = rooms.map((room) => {
      const dayMap = calendar[room.roomId] || {};
      const nightlyPrices: number[] = [];
      let available = room.maxPeople >= party;
      for (const night of nights) {
        const day = dayMap[night];
        if (!day || day.numAvail < 1 || day.price <= 0) {
          available = false;
        }
        nightlyPrices.push(day?.price ?? 0);
      }
      const total = Math.round(nightlyPrices.reduce((a, b) => a + b, 0) * 100) / 100;
      return {
        roomId: room.roomId,
        name: room.name,
        maxPeople: room.maxPeople,
        available: available && total > 0,
        nights: nights.length,
        nightlyPrices,
        total,
        currency: this.currency,
      };
    });

    return {
      checkIn,
      checkOut,
      nights: nights.length,
      adults,
      children,
      currency: this.currency,
      rooms: roomQuotes,
    };
  }

  /** Quote for a single room (used at checkout / webhook re-pricing). */
  async getRoomQuote(input: {
    roomId: string;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
  }): Promise<RoomQuote | null> {
    const quote = await this.getQuote(input);
    return quote.rooms.find((r) => r.roomId === input.roomId) || null;
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
        `Direct website booking. Deposit paid ${input.deposit} ${input.currency}, ` +
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

function addDay(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}
