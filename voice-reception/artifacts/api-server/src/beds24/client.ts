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
  roomId?: string;
  roomName: string;
  available: boolean;
  unitsAvailable?: number;
  totalPrice?: number;
  perPersonPerNight?: number;
  currency?: string;
  maxAdults?: number;
  maxPeople?: number;
  requiredUnits?: number;
  capacityAvailable?: boolean;
}

export interface AvailabilityResult {
  checkIn: string;
  checkOut: string;
  nights: number;
  numAdults: number;
  numChildren?: number;
  numInfants?: number;
  offers: RoomOffer[];
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn + "T00:00:00Z").getTime();
  const b = new Date(checkOut + "T00:00:00Z").getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

/** Shape of the booking engine's /api/booking/availability response. */
interface BookingEngineRoom {
  roomId: string;
  name: string;
  available: boolean;
  unitsAvailable: number;
  currency: string;
  maxAdults: number;
  maxPeople: number;
  requiredUnits: number;
  capacityAvailable: boolean;
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

/** Shared authenticated transport; callers never connect to Beds24 directly. */
async function bookingEngineRequest(
  path: "availability" | "nearest-available",
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<unknown> {
  const automailerUrl = process.env.AUTOMAILER_URL?.replace(/\/+$/, "");
  const adminKey = process.env.ADMIN_API_KEY;
  if (!automailerUrl || !adminKey) throw new Beds24NotConfiguredError();

  for (let attempt = 0; attempt < 2; attempt++) {
    signal?.throwIfAborted();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(`${automailerUrl}/api/booking/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify(body),
        signal: signal ? AbortSignal.any([signal, controller.signal]) : controller.signal,
      });
      if (!res.ok) {
        throw new Beds24ApiError(res.status, `Booking engine /${path} failed (${res.status})`);
      }
      return await res.json();
    } catch (err: any) {
      if (signal?.aborted) throw err;
      const transient = err?.name === "AbortError" || err instanceof TypeError ||
        (err instanceof Beds24ApiError && [502, 503, 504].includes(err.status));
      if (attempt === 0 && transient) {
        logger.warn({ path, status: err.status, errorType: err.name }, "Retrying availability lookup");
        continue;
      }
      if (err?.name === "AbortError") throw new Beds24ApiError(504, "Availability timed out");
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error("Availability request did not complete");
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
  numInfants = 0,
  signal?: AbortSignal,
): Promise<AvailabilityResult> {
  const data = await bookingEngineRequest("availability", {
    checkIn, checkOut, adults: numAdults, children: numChildren, infants: numInfants,
  }, signal) as BookingEngineAvailability;
  if (!Array.isArray(data.rooms)) throw new Error("Invalid availability response");

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
      roomId: room.roomId,
      roomName: room.name,
      available: room.available,
      unitsAvailable: room.unitsAvailable,
      totalPrice,
      perPersonPerNight:
        totalPrice != null && nights > 0 && numAdults > 0
          ? Math.round((totalPrice / nights / numAdults) * 100) / 100
          : undefined,
      currency: room.currency ?? data.currency,
      maxAdults: room.maxAdults,
      maxPeople: room.maxPeople,
      requiredUnits: room.requiredUnits,
      capacityAvailable: room.capacityAvailable,
    };
  });

  return { checkIn, checkOut, nights, numAdults, numChildren, numInfants, offers };
}

export interface NearestDateRequest {
  roomId: string;
  fromDate: string;
  nights: number;
  adults: number;
  children: number;
  infants: number;
}

export type NearestDateResult =
  | { found: true; checkIn: string; checkOut: string }
  | { found: false };

/** The exact read-only search used by the book-direct page. */
export async function findNearestAvailable(
  request: NearestDateRequest,
  signal?: AbortSignal,
): Promise<NearestDateResult> {
  const data = await bookingEngineRequest("nearest-available", { ...request }, signal) as Partial<{
    found: boolean; checkIn: string; checkOut: string;
  }> | null;
  if (data?.found === false) return { found: false };
  if (data?.found !== true || typeof data.checkIn !== "string" || typeof data.checkOut !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data.checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(data.checkOut) ||
      !Number.isFinite(Date.parse(data.checkIn)) || !Number.isFinite(Date.parse(data.checkOut)) ||
      new Date(`${data.checkIn}T00:00:00Z`).toISOString().slice(0, 10) !== data.checkIn ||
      new Date(`${data.checkOut}T00:00:00Z`).toISOString().slice(0, 10) !== data.checkOut ||
      nightsBetween(data.checkIn, data.checkOut) !== request.nights) {
    throw new Error("Invalid nearest-availability response");
  }
  return { found: true, checkIn: data.checkIn, checkOut: data.checkOut };
}

export const NEAREST_DATE_QUESTION = "Would you like me to check for the nearest available date?";

/** Compact, model-friendly summary of an availability result. */
export function formatAvailabilityForModel(result: AvailabilityResult): string {
  const available = result.offers.filter((o) => o.available);
  if (available.length === 0) {
    return JSON.stringify({
      checkIn: result.checkIn,
      checkOut: result.checkOut,
      nights: result.nights,
      numAdults: result.numAdults,
      numChildren: result.numChildren ?? 0,
      numInfants: result.numInfants ?? 0,
      anyAvailable: false,
      followUpQuestion: NEAREST_DATE_QUESTION,
      note: "No rooms available for these exact dates. Ask followUpQuestion naturally in the guest's language, " +
        "then STOP and wait for their reply. Only call check_nearest_availability if the guest agrees. " +
        "Keep the same stay length, guest counts and any room preference; do not search automatically.",
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
    unavailableRooms: result.offers.filter((o) => !o.available).map((o) => o.roomName),
    note:
      "Prices are live from the booking engine — identical to what the guest sees on /book-direct. " +
      "Quote totalPrice as the EXACT whole-stay total; do NOT recalculate or adjust it. " +
      "Inclusions: breakfast is included in every stay. " +
      "After quoting, always finish with the booking link: devoceanlodge.com/book-direct " +
      "(the guest goes there to complete the booking — you are read-only and cannot confirm reservations).",
  });
}
