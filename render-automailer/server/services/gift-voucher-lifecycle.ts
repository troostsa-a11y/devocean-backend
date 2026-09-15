import type { DatabaseService } from './database';
import { generateVoucherCode, sendVoucherEmail } from './gift-voucher';
import { retrieveGiftVoucherSession } from './stripe-booking';

/** Only trusted Stripe API responses or signature-verified events may enter here. */
export function voucherPaymentState(session: any, voucher: any): 'paid' | 'checkout_expired' | 'pending' {
  if (session.id !== voucher.stripeSessionId || session.metadata?.type !== 'gift_voucher')
    throw new Error('Voucher checkout identity mismatch');
  if (session.payment_status === 'paid') {
    if (session.currency !== 'usd' ||
        session.amount_total !== Math.round(Number(voucher.amountUsd) * 100) ||
        !session.payment_intent) throw new Error('Voucher payment amount or currency mismatch');
    return 'paid';
  }
  return session.status === 'expired' ? 'checkout_expired' : 'pending';
}

export async function applyVoucherSession(db: DatabaseService, session: any, failed = false, deliver = sendVoucherEmail) {
  const existing = await db.getGiftVoucherByStripeSession(session.id);
  if (!existing) throw new Error('Voucher record not found; retry webhook');
  const state = voucherPaymentState(session, existing);
  if (state === 'paid') {
    const intent = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent.id;
    const voucher = await db.activateGiftVoucher(session.id, generateVoucherCode(), intent);
    if (!voucher) return; // A concurrent webhook/reconciliation already activated it.
    await deliver({
      to: voucher.purchaserEmail, purchaserName: voucher.purchaserName || 'Guest',
      recipientName: voucher.recipientName || undefined, message: voucher.message || undefined,
      code: voucher.code!, amountUsd: Number(voucher.amountUsd), expiresAt: new Date(voucher.expiresAt),
      siteUrl: process.env.PUBLIC_SITE_URL || 'https://devoceanlodge.com',
    });
  } else if (state === 'checkout_expired' || failed) {
    await db.closeUnpaidGiftVoucher(session.id, failed ? 'failed' : 'checkout_expired');
  }
}

export async function reconcileVoucher(db: DatabaseService, sessionId: string) {
  await applyVoucherSession(db, await retrieveGiftVoucherSession(sessionId));
}