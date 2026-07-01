import { db, integrationTokens } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const BEDS24_API = "https://api.beds24.com/v2";
const FETCH_TIMEOUT_MS = 12_000;

function fetchWithTimeout(url: string | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  );
}
const PROVIDER = "beds24";
const PROPERTY_ID = process.env.BEDS24_PROPERTY_ID ?? "297012";

/** Thrown when no Beds24 credential is available (no stored refresh token and no invite code). */
export class Beds24NotConfiguredError extends Error {
  constructor() {
    super("Beds24 is not configured: no stored refresh token and no BEDS24_INVITE_CODE to bootstrap from.");
    this.name = "Beds24NotConfiguredError";
  }
}

/** Thrown when the Beds24 API returns a non-OK response. */
export class Beds24ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "Beds24ApiError";
  }
}

// In-memory cache for the short-lived (24h) access token.
let accessToken: string | null = null;
let accessTokenExpiresAt = 0;

async function readStoredRefreshToken(): Promise<string | null> {
  const [row] = await db
    .select()
    .from(integrationTokens)
    .where(eq(integrationTokens.provider, PROVIDER));
  return row?.refreshToken ?? null;
}

async function storeRefreshToken(refreshToken: string): Promise<void> {
  await db
    .insert(integrationTokens)
    .values({ provider: PROVIDER, refreshToken })
    .onConflictDoUpdate({
      target: integrationTokens.provider,
      set: { refreshToken, updatedAt: new Date() },
    });
}

/**
 * Exchange a one-time invite code for a refresh token + access token.
 * The invite code is single-use, so the resulting refresh token is persisted.
 */
async function bootstrapFromInviteCode(inviteCode: string): Promise<{ token: string; expiresIn: number }> {
  const res = await fetchWithTimeout(`${BEDS24_API}/authentication/setup`, {
    headers: { code: inviteCode, accept: "application/json" },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Beds24ApiError(res.status, `authentication/setup failed (${res.status}): ${text}`);
  }
  const json = JSON.parse(text) as { token?: string; refreshToken?: string; expiresIn?: number };
  if (!json.token || !json.refreshToken) {
    throw new Beds24ApiError(res.status, `authentication/setup returned no token/refreshToken: ${text}`);
  }
  await storeRefreshToken(json.refreshToken);
  logger.info("Beds24: bootstrapped refresh token from invite code");
  return { token: json.token, expiresIn: json.expiresIn ?? 86400 };
}

/** Mint a fresh access token from a stored refresh token. */
async function tokenFromRefresh(refreshToken: string): Promise<{ token: string; expiresIn: number }> {
  const res = await fetchWithTimeout(`${BEDS24_API}/authentication/token`, {
    headers: { refreshToken, accept: "application/json" },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Beds24ApiError(res.status, `authentication/token failed (${res.status}): ${text}`);
  }
  const json = JSON.parse(text) as { token?: string; expiresIn?: number };
  if (!json.token) {
    throw new Beds24ApiError(res.status, `authentication/token returned no token: ${text}`);
  }
  return { token: json.token, expiresIn: json.expiresIn ?? 86400 };
}

/** Validate a token by calling /authentication/details. Returns true if usable directly. */
async function validateDirectToken(token: string): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${BEDS24_API}/authentication/details`, {
      headers: { token, accept: "application/json" },
    });
    if (!res.ok) return false;
    const json = (await res.json().catch(() => null)) as any;
    if (json?.validToken === false) return false;
    logger.info(
      { scopes: json?.token?.scopes ?? json?.scopes },
      "Beds24: using credential as a direct long-life token",
    );
    return true;
  } catch {
    return false;
  }
}

async function getValidAccessToken(): Promise<string> {
  const now = Date.now();
  if (accessToken && now < accessTokenExpiresAt - 60_000) {
    return accessToken;
  }

  // Prefer a stored refresh token from a prior invite-code bootstrap. If it has
  // been revoked/expired, fall through to the configured env credential instead
  // of hard-failing live availability.
  const stored = await readStoredRefreshToken();
  if (stored) {
    try {
      const minted = await tokenFromRefresh(stored);
      accessToken = minted.token;
      accessTokenExpiresAt = now + minted.expiresIn * 1000;
      return accessToken;
    } catch (err) {
      logger.warn({ err }, "Beds24: stored refresh token failed; falling back to configured credential");
    }
  }

  // The configured credential may be a long-life token, a refresh token, or a
  // one-time invite code. Detect which and cache the resolved access token.
  const cred = process.env.BEDS24_TOKEN ?? process.env.BEDS24_INVITE_CODE;
  if (!cred) throw new Beds24NotConfiguredError();

  // 1) Long-life / direct access token.
  if (await validateDirectToken(cred)) {
    accessToken = cred;
    accessTokenExpiresAt = now + 30 * 60_000; // re-validate periodically
    return accessToken;
  }

  // 2) Refresh token.
  try {
    const minted = await tokenFromRefresh(cred);
    accessToken = minted.token;
    accessTokenExpiresAt = now + minted.expiresIn * 1000;
    logger.info("Beds24: minted access token from a refresh-token credential");
    return accessToken;
  } catch (err) {
    logger.warn({ err }, "Beds24: credential is not a refresh token; trying invite-code bootstrap");
  }

  // 3) One-time invite code -> store the resulting refresh token.
  const minted = await bootstrapFromInviteCode(cred);
  accessToken = minted.token;
  accessTokenExpiresAt = now + minted.expiresIn * 1000;
  return accessToken;
}

async function beds24Get(path: string, params: Record<string, string | number>): Promise<any> {
  const token = await getValidAccessToken();
  const url = new URL(BEDS24_API + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetchWithTimeout(url, { headers: { token, accept: "application/json" } });
  const text = await res.text();
  if (!res.ok) {
    throw new Beds24ApiError(res.status, `GET ${path} failed (${res.status}): ${text}`);
  }
  return JSON.parse(text);
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

// Room id -> name map, cached for the process lifetime.
let roomNameCache: Map<number, string> | null = null;

async function getRoomNames(): Promise<Map<number, string>> {
  if (roomNameCache) return roomNameCache;
  const map = new Map<number, string>();
  try {
    const json = await beds24Get("/properties", { id: PROPERTY_ID, includeAllRooms: "true" });
    const property = Array.isArray(json?.data) ? json.data[0] : json?.data;
    const rooms = property?.roomTypes ?? property?.rooms ?? [];
    for (const r of rooms) {
      if (r?.id != null && r?.name) map.set(Number(r.id), String(r.name));
    }
  } catch (err) {
    logger.warn({ err }, "Beds24: failed to load room names; will fall back to room ids");
  }
  roomNameCache = map;
  return map;
}

/**
 * Read-only live availability + pricing for the lodge for a given stay.
 * Uses GET /inventory/rooms/offers and maps room ids to names.
 */
export async function checkAvailability(
  checkIn: string,
  checkOut: string,
  numAdults = 2,
): Promise<AvailabilityResult> {
  const nights = nightsBetween(checkIn, checkOut);
  const [names, json] = await Promise.all([
    getRoomNames(),
    beds24Get("/inventory/rooms/offers", {
      propertyId: PROPERTY_ID,
      arrival: checkIn,
      departure: checkOut,
      numAdults,
    }),
  ]);

  logger.info(
    { sample: JSON.stringify(json).slice(0, 1500) },
    "Beds24: raw offers response",
  );

  const rows: any[] = Array.isArray(json?.data) ? json.data : [];
  const offers: RoomOffer[] = rows.map((row) => {
    const roomId = Number(row?.roomId ?? row?.id);
    const roomName = names.get(roomId) ?? row?.name ?? row?.roomName ?? `Room ${roomId}`;
    const offerList: any[] = row?.offers ?? [];
    const best = offerList[0];
    const price = best?.price ?? row?.price;
    const unitsAvailable = best?.numAvail ?? row?.numAvail;
    const available = offerList.length > 0 || Number(unitsAvailable) > 0;
    const totalPrice = price != null ? Number(price) : undefined;
    return {
      roomName,
      available,
      unitsAvailable: unitsAvailable != null ? Number(unitsAvailable) : undefined,
      totalPrice,
      perPersonPerNight:
        totalPrice != null && nights > 0 && numAdults > 0
          ? Math.round((totalPrice / nights / numAdults) * 100) / 100
          : undefined,
      currency: best?.currency ?? row?.currency,
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
    note: "Prices are from the live booking system. Confirm final total and complete the booking with the reservations team.",
  });
}
