/**
 * Direct-booking configuration.
 *
 * All values come from environment variables so secrets never live in code and
 * the deposit %, cancellation policy, currency and Beds24 property can be tuned
 * per environment. Safe defaults are provided so the module never crashes when
 * an optional value is missing — callers should still check `isBookingConfigured`
 * before attempting a live Beds24 / Stripe operation.
 */

export interface BookingConfig {
  // Beds24
  beds24RefreshToken: string | undefined;
  beds24PropId: string;
  beds24ApiBase: string;

  // Stripe
  stripeSecretKey: string | undefined;
  stripeWebhookSecret: string | undefined;

  // Commercial policy
  depositPercent: number;        // % of total taken now (balance on arrival)
  cancellationPolicyDays: number; // free cancellation up to N days before arrival
  currency: string;              // ISO 4217, used for Stripe + quotes

  // Guest-facing
  publicSiteUrl: string;         // used to build Stripe success/cancel URLs
  maxNights: number;             // guardrail on requested stay length
  maxGuests: number;             // guardrail on requested party size
  maxRooms: number;              // guardrail on rooms per cart (sum of qty across types)
}

function intFromEnv(name: string, fallback: number, min: number, max: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < min || n > max) return fallback;
  return n;
}

export function getBookingConfig(): BookingConfig {
  return {
    beds24RefreshToken: process.env.BEDS24_REFRESH_TOKEN,
    beds24PropId: process.env.BEDS24_PROP_ID || '297012',
    beds24ApiBase: (process.env.BEDS24_API_BASE || 'https://beds24.com/api/v2').replace(/\/+$/, ''),

    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,

    depositPercent: intFromEnv('DEPOSIT_PERCENT', 30, 1, 100),
    cancellationPolicyDays: intFromEnv('CANCELLATION_POLICY_DAYS', 30, 0, 365),
    currency: (process.env.BOOKING_CURRENCY || 'USD').toUpperCase(),

    publicSiteUrl: (process.env.PUBLIC_SITE_URL || 'https://devoceanlodge.com').replace(/\/+$/, ''),
    maxNights: intFromEnv('BOOKING_MAX_NIGHTS', 30, 1, 365),
    maxGuests: intFromEnv('BOOKING_MAX_GUESTS', 12, 1, 50),
    maxRooms: intFromEnv('BOOKING_MAX_ROOMS', 8, 1, 20),
  };
}

/** True when Beds24 + Stripe are both wired up enough to take a live booking. */
export function isBookingConfigured(cfg: BookingConfig = getBookingConfig()): boolean {
  return Boolean(cfg.beds24RefreshToken && cfg.stripeSecretKey && cfg.stripeWebhookSecret);
}

/** Round a money amount to 2 decimals, returned as a number. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Compute deposit + balance from a total using the configured deposit percent.
 * Deposit is rounded to 2 decimals; balance is the remainder so the two always
 * sum back to the exact total.
 */
export function splitDeposit(total: number, depositPercent: number): { deposit: number; balance: number } {
  const deposit = round2((total * depositPercent) / 100);
  const balance = round2(total - deposit);
  return { deposit, balance };
}

/**
 * Split `amount` across N buckets proportionally to `weights`, using the
 * largest-remainder method so the parts sum back to EXACTLY `amount` (to the
 * cent) — no rounding drift. Used to apportion the single combined deposit
 * across a multi-room cart's legs by each leg's share of the total.
 *
 * Works in integer cents internally. If all weights are zero (or none given),
 * the amount is spread as evenly as possible. Never returns negatives.
 */
export function allocateProportional(amount: number, weights: number[]): number[] {
  const n = weights.length;
  if (n === 0) return [];
  const totalCents = Math.round(amount * 100);
  if (n === 1) return [round2(totalCents / 100)];

  const safeWeights = weights.map((w) => (Number.isFinite(w) && w > 0 ? w : 0));
  let weightSum = safeWeights.reduce((s, w) => s + w, 0);
  const useEven = weightSum <= 0;
  if (useEven) {
    for (let i = 0; i < n; i++) safeWeights[i] = 1;
    weightSum = n;
  }

  // Floor each share, track the fractional remainder, then hand out the leftover
  // cents one-by-one to the buckets with the largest remainders.
  const exact = safeWeights.map((w) => (totalCents * w) / weightSum);
  const floors = exact.map((x) => Math.floor(x));
  let distributed = floors.reduce((s, x) => s + x, 0);
  let leftover = totalCents - distributed;

  const order = exact
    .map((x, i) => ({ i, frac: x - Math.floor(x) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);

  const cents = floors.slice();
  for (let k = 0; k < order.length && leftover > 0; k++) {
    cents[order[k].i] += 1;
    leftover -= 1;
  }

  return cents.map((c) => round2(c / 100));
}
