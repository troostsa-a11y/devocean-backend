import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyVoucherSession, voucherPaymentState } from './gift-voucher-lifecycle';

const record = { stripeSessionId: 'cs_test_example', amountUsd: '100.00', status: 'pending' };
const session = { id: record.stripeSessionId, metadata: { type: 'gift_voucher' },
  payment_status: 'unpaid', status: 'open', currency: 'usd', amount_total: 10000, payment_intent: null };

test('open and completed-but-unpaid sessions do not issue vouchers', () => {
  assert.equal(voucherPaymentState(session, record), 'pending');
  assert.equal(voucherPaymentState({ ...session, status: 'complete' }, record), 'pending');
});
test('only Stripe-confirmed expired sessions are classified as expired', () => {
  assert.equal(voucherPaymentState({ ...session, status: 'expired' }, record), 'checkout_expired');
});
test('payment must match voucher, currency, amount and have a payment intent', () => {
  const paid = { ...session, payment_status: 'paid', payment_intent: 'pi_example' };
  assert.equal(voucherPaymentState(paid, record), 'paid');
  for (const patch of [{ currency: 'eur' }, { amount_total: 1 }, { payment_intent: null },
    { id: 'other' }, { metadata: { type: 'booking' } }]) {
    assert.throws(() => voucherPaymentState({ ...paid, ...patch }, record));
  }
});
test('expired and failed events update unpaid records without activation or email', async () => {
  const calls: string[] = [];
  const db: any = {
    getGiftVoucherByStripeSession: async () => record,
    closeUnpaidGiftVoucher: async (_id: string, status: string) => calls.push(status),
    activateGiftVoucher: async () => { throw new Error('Must not activate'); },
  };
  await applyVoucherSession(db, { ...session, status: 'expired' });
  await applyVoucherSession(db, session, true);
  await applyVoucherSession(db, session);
  assert.deepEqual(calls, ['checkout_expired', 'failed']);
});
test('paid webhook and reconciliation races issue one code and one email', async () => {
  let activated = false;
  let deliveries = 0;
  const db: any = {
    getGiftVoucherByStripeSession: async () => record,
    activateGiftVoucher: async (_id: string, code: string) => {
      if (activated) return undefined;
      activated = true;
      return { ...record, code, expiresAt: new Date(), purchaserEmail: 'test@example.invalid' };
    },
  };
  const paid = { ...session, payment_status: 'paid', payment_intent: 'pi_example' };
  const deliver = async () => { deliveries++; };
  await Promise.all([applyVoucherSession(db, paid, false, deliver), applyVoucherSession(db, paid, false, deliver)]);
  assert.equal(deliveries, 1);
});
test('missing database record throws so Stripe can retry', async () => {
  await assert.rejects(() => applyVoucherSession({ getGiftVoucherByStripeSession: async () => undefined } as any, session));
});