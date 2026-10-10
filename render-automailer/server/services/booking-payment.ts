/**
 * Stripe currency selection and server-owned FX quotes.
 * Property prices, deposits credited in Beds24, vouchers and GA4 stay in their
 * original currency. Only the actual card deposit is converted and locked.
 */
import type { BookingPaymentCurrency, DirectBookingPaymentQuote } from '../../shared/schema';

export const PAYMENT_CURRENCIES = ['USD', 'EUR', 'ZAR'] as const;
const FX_CACHE_MS = 6 * 60 * 60 * 1000;
const FX_TIMEOUT_MS = 5_000;
const MAX_RATE_AGE_MS = 48 * 60 * 60 * 1000;
const ZERO_DECIMAL = new Set([
  'BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF',
  'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF',
]);

export function toMinorUnits(amount: number, currency: string): number {
  return Math.round(amount * (ZERO_DECIMAL.has(currency.toUpperCase()) ? 1 : 100));
}

export function selectPaymentCurrency(preferred: unknown): BookingPaymentCurrency {
  const code = typeof preferred === 'string' ? preferred.trim().toUpperCase() : '';
  return PAYMENT_CURRENCIES.includes(code as BookingPaymentCurrency)
    ? code as BookingPaymentCurrency : 'USD';
}

export class PaymentQuoteError extends Error {
  readonly status = 503;
  readonly code = 'PAYMENT_FX_UNAVAILABLE';
}

export interface PaymentFxRates {
  base: string;
  rates: Record<string, number>;
  updatedAt: string;
}

const fxCache = new Map<string, { value: PaymentFxRates; expiresAt: number }>();
const pendingFx = new Map<string, Promise<PaymentFxRates>>();

async function fetchPaymentFxRates(base: string): Promise<PaymentFxRates> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FX_TIMEOUT_MS);
  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`, {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error('FX provider unavailable');
    const data = await response.json() as any;
    const updated = Number(data.time_last_update_unix) * 1000;
    if (data.result !== 'success' || data.base_code !== base ||
        !Number.isFinite(updated) || updated > Date.now() + 300_000 ||
        Date.now() - updated > MAX_RATE_AGE_MS || !data.rates) {
      throw new Error('Invalid or stale FX rates');
    }
    const value = { base, rates: data.rates, updatedAt: new Date(updated).toISOString() };
    fxCache.set(base, {
      value,
      expiresAt: Math.min(Date.now() + FX_CACHE_MS, updated + MAX_RATE_AGE_MS),
    });
    return value;
  } catch {
    // Do not silently charge a different currency or reuse expired estimates.
    throw new PaymentQuoteError('Could not obtain a payment exchange rate. Please try again.');
  } finally {
    clearTimeout(timeout);
  }
}

export async function getPaymentFxRates(base: string): Promise<PaymentFxRates> {
  const cached = fxCache.get(base);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  const inFlight = pendingFx.get(base);
  if (inFlight) return inFlight;
  const request = fetchPaymentFxRates(base);
  pendingFx.set(base, request);
  try {
    return await request;
  } finally {
    pendingFx.delete(base);
  }
}

export async function quoteBookingPayment(
  baseQuote: { currency: string; deposit: number },
  preferredCurrency: unknown,
  loadRates: (base: string) => Promise<PaymentFxRates> = getPaymentFxRates,
): Promise<DirectBookingPaymentQuote> {
  const baseCurrency = baseQuote.currency.toUpperCase();
  const baseDeposit = baseQuote.deposit;
  if (!/^[A-Z]{3}$/.test(baseCurrency) || !Number.isFinite(baseDeposit) || baseDeposit < 0) {
    throw new Error('Invalid authoritative booking deposit');
  }
  const currency = selectPaymentCurrency(preferredCurrency);
  let exchangeRate = 1;
  let rateUpdatedAt: string | null = null;
  if (baseCurrency !== currency) {
    const fx = await loadRates(baseCurrency);
    exchangeRate = fx.rates[currency];
    rateUpdatedAt = fx.updatedAt;
    if (fx.base !== baseCurrency || !Number.isFinite(exchangeRate) || exchangeRate <= 0) {
      throw new PaymentQuoteError('The selected payment currency is temporarily unavailable. Please try again.');
    }
  }
  // All allowed payment currencies use two decimal places. Integer minor units
  // are the payment authority, not a browser's rounded display amount.
  const depositMinor = Math.round((baseDeposit * exchangeRate + Number.EPSILON) * 100);
  if (!Number.isSafeInteger(depositMinor) || depositMinor < 0 ||
      (baseDeposit > 0 && depositMinor === 0)) {
    throw new PaymentQuoteError('Could not calculate the payment amount. Please try again.');
  }
  return {
    baseCurrency, baseDeposit, currency, depositMinor, deposit: depositMinor / 100,
    exchangeRate, quotedAt: new Date().toISOString(), rateUpdatedAt,
  };
}

/** Legacy sessions are checked against their original property-currency charge. */
export function validateBookingPayment(
  session: { id: string; mode?: string; payment_status?: string; currency?: string; amount_total?: number },
  record: {
    stripeSessionId?: string | null;
    currency: string;
    depositAmount: string | number;
    paymentQuote?: DirectBookingPaymentQuote | null;
  },
): string | null {
  const locked = record.paymentQuote;
  const expectedCurrency = locked?.currency || record.currency;
  const expectedMinor = locked?.depositMinor ?? toMinorUnits(Number(record.depositAmount), record.currency);
  if (record.stripeSessionId && session.id !== record.stripeSessionId) return 'Checkout session does not match the booking';
  if (session.mode !== 'payment') return 'Checkout mode does not match the booking';
  if (session.payment_status !== 'paid' &&
      !(expectedMinor === 0 && session.payment_status === 'no_payment_required')) {
    return 'Checkout payment has not been completed';
  }
  if (locked && (
    selectPaymentCurrency(locked.currency) !== locked.currency ||
    locked.baseCurrency !== record.currency ||
    toMinorUnits(locked.baseDeposit, record.currency) !== toMinorUnits(Number(record.depositAmount), record.currency)
  )) return 'Locked payment quote does not match the booking';
  if (!Number.isSafeInteger(expectedMinor) || expectedMinor < 0 ||
      session.currency?.toUpperCase() !== expectedCurrency.toUpperCase() ||
      session.amount_total !== expectedMinor) {
    return `Payment mismatch: expected ${expectedMinor} ${expectedCurrency} minor units, received ${session.amount_total} ${session.currency}`;
  }
  return null;
}
