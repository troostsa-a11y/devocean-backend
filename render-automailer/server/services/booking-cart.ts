/**
 * Multi-room ("per-type cart") quote engine for the native direct-booking flow.
 *
 * A cart is a list of room-type lines `{ roomId, offerId, qty }`. This module
 * expands those lines into individual physical-room "legs", auto-splits the
 * party's guests across them (capacity-aware, deterministic), prices every leg
 * from a fresh Beds24 quote, and apportions a single combined deposit back over
 * the legs with no rounding drift.
 *
 * It is the ONE place money + occupancy are computed, reused by /quote (live
 * preview), /checkout (the amount actually charged) and the webhook sell-out
 * recheck. Client-supplied amounts are never trusted — only roomId/offerId/qty
 * select WHAT to price; the price always comes from Beds24 here.
 */

import {
  Beds24Service,
  Beds24Error,
  type RoomOffer,
} from './beds24';
import {
  getBookingConfig,
  splitDeposit,
  round2,
  type BookingConfig,
} from '../config/booking-config';
import type { DirectBookingLeg } from '../../shared/schema';

export type CartErrorCode =
  | 'EMPTY_CART'
  | 'BAD_LINE'
  | 'TOO_MANY_ROOMS'
  | 'TOO_FEW_ADULTS'
  | 'ROOM_NOT_FOUND'
  | 'PARTY_TOO_LARGE'
  | 'UNITS_EXCEEDED'
  | 'SOLD_OUT';

/** A validation/availability error with a user-safe message + machine code. */
export class BookingCartError extends Error {
  status: number;
  code: CartErrorCode;
  constructor(message: string, status: number, code: CartErrorCode) {
    super(message);
    this.name = 'BookingCartError';
    this.status = status;
    this.code = code;
  }
}

export interface CartLineInput {
  roomId: string;
  offerId: number | null;
  qty: number;
}

/** Aggregated per-room-type view for the cart UI (one row per roomId+offer). */
export interface CartTypeLine {
  roomId: string;
  roomName: string;
  offerId: number | null;
  offerName: string | null;
  maxPeople: number;
  qty: number;
  unitTotal: number;  // representative per-room total (first leg of this type)
  lineTotal: number;  // Σ of every leg.total for this type
}

export interface CartQuote {
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  currency: string;
  depositPercent: number;
  cancellationPolicyDays: number;
  total: number;
  deposit: number;
  balance: number;
  rooms: number;                // Σ qty (physical rooms)
  legs: DirectBookingLeg[];     // one per physical room, priced + deposit-apportioned
  lines: CartTypeLine[];        // aggregated for display
}

interface SlotCap {
  roomId: string;
  maxPeople: number;
  maxAdults: number;
  maxChildren: number;
  offerId: number | null;
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(`${checkIn}T00:00:00Z`).getTime();
  const b = new Date(`${checkOut}T00:00:00Z`).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** Parse + validate one raw cart line. */
function normalizeLine(raw: any): CartLineInput {
  const roomId = String(raw?.roomId ?? '').trim();
  if (!roomId) throw new BookingCartError('Invalid room selection.', 400, 'BAD_LINE');

  const offerRaw = raw?.offerId;
  const offerId =
    offerRaw === null || offerRaw === undefined || offerRaw === ''
      ? null
      : Number.parseInt(offerRaw, 10);
  if (offerId !== null && !Number.isFinite(offerId)) {
    throw new BookingCartError('Invalid rate plan in cart.', 400, 'BAD_LINE');
  }

  const qty = Number.parseInt(raw?.qty, 10);
  if (!Number.isFinite(qty) || qty < 1) {
    throw new BookingCartError('Invalid room quantity.', 400, 'BAD_LINE');
  }
  return { roomId, offerId, qty: Math.min(qty, 20) };
}

/** Merge duplicate lines (same room + offer) so qty is summed once. */
function mergeLines(lines: CartLineInput[]): CartLineInput[] {
  const map = new Map<string, CartLineInput>();
  for (const l of lines) {
    const key = `${l.roomId}__${l.offerId ?? 'any'}`;
    const existing = map.get(key);
    if (existing) existing.qty += l.qty;
    else map.set(key, { ...l });
  }
  return Array.from(map.values());
}

/**
 * Spread `adults` + `children` across `slots` (one slot = one physical room),
 * giving each slot at least one adult and respecting each room's adult/child/
 * total caps. Deterministic (front-loads the earliest rooms) so the same cart
 * always yields the same legs at quote, checkout and webhook time.
 *
 * Throws PARTY_TOO_LARGE if the guests cannot be seated within the caps.
 * Callers must already guarantee `adults >= slots.length`.
 */
export function distributeGuests(
  slots: SlotCap[],
  adults: number,
  children: number,
): Array<{ adults: number; children: number }> {
  const n = slots.length;
  const assign = slots.map(() => ({ adults: 1, children: 0 })); // 1 adult per room
  let remAdults = adults - n;
  let remChildren = children;

  // Distribute the remaining adults, capped by maxAdults and maxPeople.
  for (let i = 0; i < n && remAdults > 0; i++) {
    const room = slots[i];
    const maxA = room.maxAdults > 0 ? room.maxAdults : room.maxPeople;
    const room_used = assign[i].adults; // children still 0 at this stage
    const canAdd = Math.min(remAdults, maxA - assign[i].adults, room.maxPeople - room_used);
    const add = Math.max(0, canAdd);
    assign[i].adults += add;
    remAdults -= add;
  }

  // Then the children, capped by maxChildren and the room's remaining space.
  for (let i = 0; i < n && remChildren > 0; i++) {
    const room = slots[i];
    const maxC = Number.isFinite(room.maxChildren) ? room.maxChildren : room.maxPeople;
    const used = assign[i].adults + assign[i].children;
    const canAdd = Math.min(remChildren, maxC - assign[i].children, room.maxPeople - used);
    const add = Math.max(0, canAdd);
    assign[i].children += add;
    remChildren -= add;
  }

  if (remAdults > 0 || remChildren > 0) {
    throw new BookingCartError(
      'The selected rooms cannot fit that mix of adults and children.',
      409,
      'PARTY_TOO_LARGE',
    );
  }
  return assign;
}

/**
 * Build a fully-priced quote for a multi-room cart. Throws BookingCartError
 * (user-safe) for validation/availability problems and Beds24Error for upstream
 * failures.
 */
export async function computeCartQuote(
  beds24: Beds24Service,
  stay: { checkIn: string; checkOut: string; adults: number; children: number },
  cartLines: any[],
  cfg: BookingConfig = getBookingConfig(),
): Promise<CartQuote> {
  if (!Array.isArray(cartLines) || cartLines.length === 0) {
    throw new BookingCartError('Please choose at least one room.', 400, 'EMPTY_CART');
  }

  const lines = mergeLines(cartLines.map(normalizeLine));
  const totalRooms = lines.reduce((s, l) => s + l.qty, 0);
  if (totalRooms < 1) {
    throw new BookingCartError('Please choose at least one room.', 400, 'EMPTY_CART');
  }
  if (totalRooms > cfg.maxRooms) {
    throw new BookingCartError(`You can book at most ${cfg.maxRooms} rooms per booking.`, 400, 'TOO_MANY_ROOMS');
  }
  if (totalRooms > stay.adults) {
    throw new BookingCartError('Each room needs at least one adult — add adults or remove a room.', 400, 'TOO_FEW_ADULTS');
  }

  const rooms = await beds24.getRooms();
  const roomById = new Map(rooms.map((r) => [r.roomId, r]));

  // Expand cart lines → individual physical-room slots.
  const slots: SlotCap[] = [];
  for (const l of lines) {
    const room = roomById.get(l.roomId);
    if (!room) throw new BookingCartError('One of the selected rooms no longer exists.', 404, 'ROOM_NOT_FOUND');
    for (let i = 0; i < l.qty; i++) {
      slots.push({
        roomId: room.roomId,
        maxPeople: room.maxPeople,
        maxAdults: room.maxAdults,
        maxChildren: room.maxChildren,
        offerId: l.offerId,
      });
    }
  }

  const party = stay.adults + stay.children;
  const capSum = slots.reduce((s, sl) => s + sl.maxPeople, 0);
  if (capSum < party) {
    throw new BookingCartError(`The selected rooms hold up to ${capSum} guests.`, 409, 'PARTY_TOO_LARGE');
  }

  const dist = distributeGuests(slots, stay.adults, stay.children);

  // Price each leg at its assigned occupancy. Rooms sharing an occupancy reuse
  // a single Beds24 offers call (cached by "adults_children").
  const occCache = new Map<string, Record<string, RoomOffer[]>>();
  const offersForOcc = async (a: number, c: number) => {
    const key = `${a}_${c}`;
    let m = occCache.get(key);
    if (!m) {
      m = await beds24.getPricedOffersByRoom({ checkIn: stay.checkIn, checkOut: stay.checkOut, adults: a, children: c });
      occCache.set(key, m);
    }
    return m;
  };

  const legs: DirectBookingLeg[] = [];
  const legDepositPercents: number[] = []; // parallel to `legs`, set per offer type
  const unitsByRoom = new Map<string, number>(); // min units observed per room
  const countByRoom = new Map<string, number>();

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const occ = dist[i];
    const room = roomById.get(slot.roomId)!;
    const map = await offersForOcc(occ.adults, occ.children);
    const offers = map[slot.roomId] || [];
    if (offers.length === 0) {
      throw new BookingCartError(`${room.name} is no longer available for those dates.`, 409, 'SOLD_OUT');
    }
    // Prefer the chosen rate plan; fall back to the cheapest still-bookable one
    // (price is recomputed here either way, so this only affects which plan label
    // is recorded — never the amount integrity).
    const offer =
      (slot.offerId != null ? offers.find((o) => o.offerId === slot.offerId) : undefined) || offers[0];

    const prevU = unitsByRoom.get(slot.roomId);
    unitsByRoom.set(slot.roomId, prevU === undefined ? offer.unitsAvailable : Math.min(prevU, offer.unitsAvailable));
    countByRoom.set(slot.roomId, (countByRoom.get(slot.roomId) || 0) + 1);

    legs.push({
      roomId: slot.roomId,
      roomName: room.name,
      offerId: offer.offerId,
      offerName: offer.offerName || null,
      adults: occ.adults,
      children: occ.children,
      total: offer.total,
      deposit: 0,
      balance: 0,
      beds24BookingId: null,
    });
    // Last-minute rate plans are always paid in full at booking, regardless of
    // the arrival-date-based rule — never proportionally blended with other legs.
    legDepositPercents.push(beds24.getDepositPercentForOffer(stay.checkIn, offer.type));
  }

  // Don't sell more units of a room type than Beds24 still has.
  for (const [roomId, count] of countByRoom) {
    const units = unitsByRoom.get(roomId) ?? 0;
    if (count > units) {
      const name = roomById.get(roomId)?.name || 'room';
      throw new BookingCartError(
        units > 0
          ? `Only ${units} "${name}" left for those dates.`
          : `${name} is no longer available for those dates.`,
        409,
        'UNITS_EXCEEDED',
      );
    }
  }

  // Combined money: each leg's deposit is priced from its OWN effective %
  // (100% for last-minute rate plans, otherwise the arrival-date %) — never
  // proportionally blended, so a last-minute leg is always charged in full
  // regardless of what other rooms in the same cart are paying now.
  const total = round2(legs.reduce((s, l) => s + l.total, 0));
  let deposit = 0;
  legs.forEach((l, i) => {
    const { deposit: legDeposit, balance: legBalance } = splitDeposit(l.total, legDepositPercents[i]);
    l.deposit = legDeposit;
    l.balance = legBalance;
    deposit = round2(deposit + legDeposit);
  });
  const balance = round2(total - deposit);
  // Single number shown as "Deposit now (X%)": the leg's own % when every leg
  // shares the same rate, otherwise the blended % actually being charged now.
  const depositPercent = legDepositPercents.every((p) => p === legDepositPercents[0])
    ? legDepositPercents[0]
    : (total > 0 ? Math.round((deposit / total) * 100) : beds24.getDepositPercentForArrival(stay.checkIn));

  const currency = beds24.getCurrency() || cfg.currency;
  const nights = nightsBetween(stay.checkIn, stay.checkOut);

  // Aggregate per-type lines for display.
  const lineMap = new Map<string, CartTypeLine>();
  for (const l of legs) {
    const key = `${l.roomId}__${l.offerId}`;
    let t = lineMap.get(key);
    if (!t) {
      t = {
        roomId: l.roomId,
        roomName: l.roomName,
        offerId: l.offerId,
        offerName: l.offerName,
        maxPeople: roomById.get(l.roomId)?.maxPeople ?? 0,
        qty: 0,
        unitTotal: l.total,
        lineTotal: 0,
      };
      lineMap.set(key, t);
    }
    t.qty += 1;
    t.lineTotal = round2(t.lineTotal + l.total);
  }

  return {
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    nights,
    adults: stay.adults,
    children: stay.children,
    currency,
    depositPercent,
    cancellationPolicyDays: beds24.getCancellationDays(),
    total,
    deposit,
    balance,
    rooms: totalRooms,
    legs,
    lines: Array.from(lineMap.values()),
  };
}

export { Beds24Error };
