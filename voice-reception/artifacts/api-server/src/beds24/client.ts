/**
 * Availability client for Marin — thin proxy to the booking engine.
 *
 * All pricing, offer selection, rounding, and currency logic lives in
 * render-automailer/server/services/beds24.ts (the canonical source).
 * This module calls /api/booking/availability on that service so Marin
 * always quotes the same figures as the /book-direct page — no independent
 * calculation, no separate Beds24 connection, no divergence.
 */

import { logger } from "../lib/logger";

const FETCH_TIMEOUT_MS = 15_000;

/** Thrown when the booking engine URL / admin key is not configured. */
export class Beds24NotConfiguredError extends Error {
  constructor() {
    super(
      "Booking engine is not configured: AUTOMAILER_URL or ADMIN_API_KEY is missing.",
    );
    this.name = "Beds24NotConfiguredError";
  }
}

/** Thrown when the booking engine returns a non-OK response. */
export class Beds24ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "Beds24ApiError";
  }
}

export interface RoomOffer {
  roomName: string;
  available: boolean;
  unitsAvailable?: number;
  totalPrice?: number;
  perPersonPerNight?: number;
  currency?: string;
}

export interface AvailabilityResult {
  checkIn: string;
  checkOut: string;
  nights: number;
  numAdults: number;
  offers: RoomOffer[];
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn + "T00:00:00Z").getTime();
  const b = new Date(checkOut + "T00:00:00Z").getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

/** Shape of the booking engine's /api/booking/availability response. */
interface BookingEngineRoom {
  name: string;
  available: boolean;
  unitsAvailable: number;
  currency: string;
  offers: Array<{ total: number; unitsAvailable: number }>;
}

interface BookingEngineAvailability {
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  currency: string;
  rooms: BookingEngineRoom[];
}

/**
 * Fetch availability + pricing via the booking engine.
 *
 * Prices are identical to /book-direct:
 *  - cheapest offer selected (booking engine sorts offers ascending)
 *  - property priceRounding applied (nearestOne → Math.round)
 *  - bookingPageMultiplier NOT applied (direct-booking channel)
 */
export async function checkAvailability(
  checkIn: string,
  checkOut: string,
  numAdults = 2,
  numChildren = 0,
): Promise<AvailabilityResult> {
  const automailerUrl = process.env.AUTOMAILER_URL?.replace(/\/+$/, "");
  const adminKey = process.env.ADMIN_API_KEY;
  if (!automailerUrl || !adminKey) throw new Beds24NotConfiguredError();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${automailerUrl}/api/booking/availability`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey,
      },
      body: JSON.stringify({
        checkIn,
        checkOut,
        adults: numAdults,
        children: numChildren,
      }),
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timer);
    if (err?.name === "AbortError") {
      throw new Beds24ApiError(
        504,
        `Booking engine availability timed out after ${FETCH_TIMEOUT_MS}ms`,
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Beds24ApiError(
      res.status,
      `Booking engine /availability failed (${res.status}): ${body.slice(0, 200)}`,
    );
  }

  const data = (await res.json()) as BookingEngineAvailability;

  logger.info(
    { checkIn, checkOut, numAdults, numChildren, rooms: data.rooms?.length ?? 0 },
    "Beds24: availability via booking engine",
  );

  const nights = data.nights ?? nightsBetween(checkIn, checkOut);

  // Map to the existing RoomOffer shape used by tool.ts.
  // Booking engine returns offers sorted cheapest-first; offers[0] is the best price.
  const offers: RoomOffer[] = (data.rooms ?? []).map((room) => {
    const cheapest = room.offers?.[0];
    const totalPrice = cheapest != null ? Number(cheapest.total) : undefined;
    return {
      roomName: room.name,
      available: room.available,
      unitsAvailable: room.unitsAvailable,
      totalPrice,
      perPersonPerNight:
        totalPrice != null && nights > 0 && numAdults > 0
          ? Math.round((totalPrice / nights / numAdults) * 100) / 100
          : undefined,
      currency: room.currency ?? data.currency,
    };
  });

  return { checkIn, checkOut, nights, numAdults, offers };
}

/** Compact, model-friendly summary of an availability result. */
export function formatAvailabilityForModel(result: AvailabilityResult): string {
  const available = result.offers.filter((o) => o.available);
  if (available.length === 0) {
    return JSON.stringify({
      checkIn: result.checkIn,
      checkOut: result.checkOut,
      nights: result.nights,
      numAdults: result.numAdults,
      anyAvailable: false,
      note: "No rooms available for these exact dates.",
    });
  }
  return JSON.stringify({
    checkIn: result.checkIn,
    checkOut: result.checkOut,
    nights: result.nights,
    numAdults: result.numAdults,
    anyAvailable: true,
    rooms: available.map((o) => ({
      room: o.roomName,
      unitsAvailable: o.unitsAvailable,
      totalPrice: o.totalPrice,
      perPersonPerNight: o.perPersonPerNight,
      currency: o.currency,
    })),
    note:
      "Prices are live from the booking engine — identical to the /book-direct page. " +
      "Quote totalPrice as the whole-stay total. " +
      "Confirm the final booking with the reservations team.",
  });
}
