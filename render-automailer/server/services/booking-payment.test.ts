// Fully isolated unit tests: no Stripe requests, real payments, Beds24 or DB.
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PAYMENT_CURRENCIES, PaymentQuoteError, quoteBookingPayment,
  selectPaymentCurrency, validateBookingPayment,
} from './booking-payment';
import { buildDepositCheckoutParams } from './stripe-booking';
import type { BookingConfig } from '../config/booking-config';

const loadRates = async (base: string) => ({
  base, rates: { USD: 1, EUR: 0.92, ZAR: 18.31 },
  updatedAt: '2026-10-10T00:00:00.000Z',
});
const cfg: BookingConfig = {
  beds24RefreshToken: undefined, beds24PropId: 'test', beds24ApiBase: 'https://example.test',
  stripeSecretKey: undefined, stripeWebhookSecret: undefined,
  depositPercent: 50, cancellationPolicyDays: 30, currency: 'USD',
  publicSiteUrl: 'https://example.test', maxNights: 30, maxGuests: 12, maxRooms: 8,
};

test('currency policy is USD default, then matching EUR or ZAR, never another currency', () => {
  assert.deepEqual(PAYMENT_CURRENCIES, ['USD', 'EUR', 'ZAR']);
  for (const [input, expected] of [
    ['USD', 'USD'], ['EUR', 'EUR'], ['ZAR', 'ZAR'], ['eur', 'EUR'],
    ['MZN', 'USD'], ['GBP', 'USD'], ['CHF', 'USD'], [null, 'USD'],
    [undefined, 'USD'], ['', 'USD'], [{ currency: 'EUR' }, 'USD'],
  ]) assert.equal(selectPaymentCurrency(input), expected);
});

test('USD and MZN preferences keep USD amounts without consulting FX', async () => {
  for (const currency of ['USD', 'MZN', 'GBP', undefined]) {
    const payment = await quoteBookingPayment({ currency: 'USD', deposit: 50.01 }, currency, async () => {
      throw new Error('FX must not be requested');
    });
    assert.equal(payment.currency, 'USD');
    assert.equal(payment.depositMinor, 5001);
    assert.equal(payment.deposit, 50.01);
    assert.equal(payment.exchangeRate, 1);
  }
});

test('EUR and ZAR amounts come from authoritative base deposits and server FX', async () => {
  const base = { currency: 'USD', deposit: 50.01 };
  const euro = await quoteBookingPayment(base, 'EUR', loadRates);
  const rand = await quoteBookingPayment(base, 'ZAR', loadRates);
  assert.equal(euro.depositMinor, 4601);
  assert.equal(euro.deposit, 46.01);
  assert.equal(rand.depositMinor, 91568);
  assert.equal(rand.deposit, 915.68);
  assert.equal(euro.baseCurrency, 'USD');
  assert.equal(euro.baseDeposit, 50.01);
  assert.deepEqual(base, { currency: 'USD', deposit: 50.01 });
});

test('bad FX cannot silently switch a chosen payment currency to USD', async () => {
  for (const rates of [{}, { EUR: 0 }, { EUR: -1 }, { EUR: NaN }, { EUR: Infinity }]) {
    await assert.rejects(
      quoteBookingPayment({ currency: 'USD', deposit: 50 }, 'EUR',
        async () => ({ base: 'USD', rates, updatedAt: '2026-10-10T00:00:00Z' })),
      PaymentQuoteError,
    );
  }
});

test('Stripe receives a single allowed currency, disabled localization and the locked amount', async () => {
  for (const preferred of ['USD', 'EUR', 'ZAR', 'MZN']) {
    const paymentQuote = await quoteBookingPayment({ currency: 'USD', deposit: 50.01 }, preferred, loadRates);
    const params = buildDepositCheckoutParams({
      sessionRef: 'isolated-payment-test', currency: 'USD', depositAmount: 50.01,
      balanceDue: 50, roomName: 'Test room', checkIn: '2027-01-10',
      checkOut: '2027-01-12', guestEmail: 'guest@example.test', paymentQuote,
    }, cfg);
    assert.deepEqual(params.adaptive_pricing, { enabled: false });
    assert.equal(params.currency, paymentQuote.currency.toLowerCase());
    assert.equal(params.line_items![0].price_data!.currency, paymentQuote.currency.toLowerCase());
    assert.equal(params.line_items![0].price_data!.unit_amount, paymentQuote.depositMinor);
    assert.match(params.line_items![0].price_data!.product_data!.description!, /50 USD due on arrival/);
    assert.equal(params.metadata!.baseCurrency, 'USD');
    assert.equal(params.metadata!.paymentCurrency, paymentQuote.currency);
  }
});

test('webhook validates the persisted charge, not a freshly converted estimate', async () => {
  const paymentQuote = await quoteBookingPayment({ currency: 'USD', deposit: 50.01 }, 'EUR', loadRates);
  const record = { stripeSessionId: 'cs_test', currency: 'USD', depositAmount: '50.01', paymentQuote };
  const session = { id: 'cs_test', mode: 'payment', payment_status: 'paid', currency: 'eur', amount_total: 4601 };
  assert.equal(validateBookingPayment(session, record), null);
  for (const patch of [
    { amount_total: 4600 }, { currency: 'mzn' }, { currency: 'usd' },
    { id: 'cs_other' }, { mode: 'setup' }, { payment_status: 'unpaid' },
  ]) assert.notEqual(validateBookingPayment({ ...session, ...patch }, record), null);
  assert.notEqual(validateBookingPayment(session, { ...record, depositAmount: '75.00' }), null);
});

test('legacy USD sessions remain valid after the new quote column is added', () => {
  const session = { id: 'cs_legacy', mode: 'payment', payment_status: 'paid', currency: 'usd', amount_total: 5000 };
  assert.equal(validateBookingPayment(session, { currency: 'USD', depositAmount: '50.00' }), null);
});

test('legacy zero-decimal sessions use their original minor-unit convention', () => {
  assert.equal(validateBookingPayment({
    id: 'cs_legacy_jpy', mode: 'payment', payment_status: 'paid', currency: 'jpy', amount_total: 1000,
  }, { currency: 'JPY', depositAmount: '1000.00' }), null);
});

test('fully voucher-funded bookings accept verified zero-value completion, not unpaid sessions', async () => {
  const paymentQuote = await quoteBookingPayment({ currency: 'USD', deposit: 0 }, 'USD');
  const record = { currency: 'USD', depositAmount: '0.00', paymentQuote };
  assert.equal(validateBookingPayment({
    id: 'cs_zero', mode: 'payment', payment_status: 'no_payment_required',
    currency: 'usd', amount_total: 0,
  }, record), null);
});
