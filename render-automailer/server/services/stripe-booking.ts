/**
 * Stripe deposit-checkout helper for the native booking flow.
 *
 * Payment is the source of truth: a booking is only created in Beds24 after
 * Stripe confirms `checkout.session.completed` via a signature-verified webhook.
 * Amounts are always passed in by the server (recomputed from a fresh Beds24
 * quote) — never taken from the browser.
 */

import Stripe from 'stripe';
import { getBookingConfig, type BookingConfig } from '../config/booking-config';

// Currencies Stripe treats as zero-decimal (amount already in major units).
const ZERO_DECIMAL = new Set([
  'BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF',
  'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF',
]);

let stripeClient: Stripe | null = null;

function getStripe(cfg: BookingConfig): Stripe {
  if (!cfg.stripeSecretKey) {
    throw new Error('Stripe is not configured (missing STRIPE_SECRET_KEY)');
  }
  if (!stripeClient) {
    stripeClient = new Stripe(cfg.stripeSecretKey, { apiVersion: '2025-01-27.acacia' as any });
  }
  return stripeClient;
}

/** Convert a major-unit amount to Stripe's smallest currency unit. */
export function toMinorUnits(amount: number, currency: string): number {
  if (ZERO_DECIMAL.has(currency.toUpperCase())) {
    return Math.round(amount);
  }
  return Math.round(amount * 100);
}

// Stripe Checkout `locale` is an enum with exact, case-sensitive values. Map
// the app's locale codes (any case, e.g. "PT-BR", "en-gb") to a supported
// Stripe locale, falling back to "auto" so an unknown language never breaks
// session creation.
const STRIPE_LOCALE_BY_BASE: Record<string, string> = {
  en: 'en', de: 'de', fr: 'fr', es: 'es', it: 'it', nl: 'nl',
  pt: 'pt', sv: 'sv', pl: 'pl', ro: 'ro', hr: 'hr', cs: 'cs',
  tr: 'tr', ja: 'ja', zh: 'zh', ru: 'ru',
};
// Region-specific overrides that Stripe supports with exact casing.
const STRIPE_LOCALE_EXACT: Record<string, string> = {
  'en-gb': 'en-GB', 'pt-br': 'pt-BR', 'fr-ca': 'fr-CA',
  'zh-hk': 'zh-HK', 'zh-tw': 'zh-TW', 'es-419': 'es-419',
};

export function toStripeLocale(raw?: string): string {
  if (!raw) return 'auto';
  const lower = String(raw).trim().toLowerCase();
  if (STRIPE_LOCALE_EXACT[lower]) return STRIPE_LOCALE_EXACT[lower];
  const base = lower.split('-')[0];
  return STRIPE_LOCALE_BY_BASE[base] || 'auto';
}

export interface CheckoutInput {
  sessionRef: string;          // our internal ref (also the success-page key)
  depositAmount: number;       // major units
  currency: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  balanceDue: number;
  guestEmail: string;
  locale?: string;
}

export async function createDepositCheckoutSession(
  input: CheckoutInput,
  cfg: BookingConfig = getBookingConfig(),
): Promise<{ url: string; stripeSessionId: string }> {
  const stripe = getStripe(cfg);
  const currency = input.currency.toLowerCase();

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: input.guestEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: toMinorUnits(input.depositAmount, input.currency),
          product_data: {
            name: `Deposit — ${input.roomName}`,
            description:
              `Stay ${input.checkIn} → ${input.checkOut}. ` +
              `Balance of ${input.balanceDue} ${input.currency.toUpperCase()} due on arrival.`,
          },
        },
      },
    ],
    payment_intent_data: {
      metadata: { sessionRef: input.sessionRef, kind: 'lodge_deposit' },
    },
    metadata: { sessionRef: input.sessionRef, kind: 'lodge_deposit' },
    success_url: `${cfg.publicSiteUrl}/booking-confirmed?ref=${encodeURIComponent(input.sessionRef)}`,
    cancel_url: `${cfg.publicSiteUrl}/book-direct?canceled=1`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min hold
    locale: toStripeLocale(input.locale) as any,
  });

  if (!session.url) throw new Error('Stripe did not return a checkout URL');
  return { url: session.url, stripeSessionId: session.id };
}

/** Verify and parse a webhook payload. Throws on bad signature. */
export function constructWebhookEvent(
  rawBody: Buffer | string,
  signature: string | undefined,
  cfg: BookingConfig = getBookingConfig(),
): Stripe.Event {
  const stripe = getStripe(cfg);
  if (!cfg.stripeWebhookSecret) {
    throw new Error('Stripe webhook secret not configured (STRIPE_WEBHOOK_SECRET)');
  }
  if (!signature) {
    throw new Error('Missing Stripe-Signature header');
  }
  return stripe.webhooks.constructEvent(rawBody, signature, cfg.stripeWebhookSecret);
}

/** Refund a payment intent in full (used when a room sold out before confirmation). */
export async function refundPaymentIntent(
  paymentIntentId: string,
  reason: 'requested_by_customer' | 'duplicate' | 'fraudulent' = 'requested_by_customer',
  cfg: BookingConfig = getBookingConfig(),
): Promise<void> {
  const stripe = getStripe(cfg);
  await stripe.refunds.create({ payment_intent: paymentIntentId, reason });
}
