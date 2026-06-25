/**
 * Native direct-booking API routes.
 *
 * Trust model:
 *  - /availability, /checkout, /result are reached through Cloudflare Pages
 *    Functions that attach the shared x-admin-key (same pattern as track-session),
 *    so they sit behind `requireAdminKey`.
 *  - /webhook is called directly by Stripe and is secured by signature
 *    verification (NOT the admin key).
 *  - All prices/deposits are recomputed server-side from a fresh Beds24 quote;
 *    nothing money-related is trusted from the client.
 *  - A Beds24 booking is created ONLY from a verified checkout.session.completed
 *    event. If the room sold out in the meantime the deposit is auto-refunded.
 */

import express, { type Router, type RequestHandler } from 'express';
import crypto from 'crypto';
import type { DatabaseService } from '../services/database';
import { Beds24Service, Beds24Error } from '../services/beds24';
import {
  createDepositCheckoutSession,
  constructWebhookEvent,
  refundPaymentIntent,
} from '../services/stripe-booking';
import {
  getBookingConfig,
  isBookingConfigured,
  splitDeposit,
} from '../config/booking-config';

// ─── tiny in-memory rate limiter (per IP, sliding window) ────────────────────
function makeRateLimiter(maxRequests: number, windowMs: number): RequestHandler {
  const hits = new Map<string, number[]>();
  return (req, res, next) => {
    const ip =
      (req.headers['cf-connecting-ip'] as string) ||
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      'unknown';
    const now = Date.now();
    const arr = (hits.get(ip) || []).filter((t) => now - t < windowMs);
    if (arr.length >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests, please slow down.' });
    }
    arr.push(now);
    hits.set(ip, arr);
    next();
  };
}

// ─── validation helpers ──────────────────────────────────────────────────────
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(s: unknown): s is string {
  if (typeof s !== 'string' || !ISO_DATE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime());
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(`${checkIn}T00:00:00Z`).getTime();
  const b = new Date(`${checkOut}T00:00:00Z`).getTime();
  return Math.round((b - a) / 86_400_000);
}

interface StayInput {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
}

function parseStay(body: any): { value?: StayInput; error?: string } {
  const cfg = getBookingConfig();
  const checkIn = body?.checkIn;
  const checkOut = body?.checkOut;
  const adults = Number.parseInt(body?.adults, 10);
  const children = Number.parseInt(body?.children ?? 0, 10);

  if (!isValidDate(checkIn) || !isValidDate(checkOut)) {
    return { error: 'Invalid check-in/check-out date (expected YYYY-MM-DD)' };
  }
  if (checkIn < todayUTC()) return { error: 'Check-in cannot be in the past' };
  const nights = nightsBetween(checkIn, checkOut);
  if (nights < 1) return { error: 'Check-out must be after check-in' };
  if (nights > cfg.maxNights) return { error: `Maximum stay is ${cfg.maxNights} nights` };
  if (!Number.isFinite(adults) || adults < 1) return { error: 'At least one adult is required' };
  if (!Number.isFinite(children) || children < 0) return { error: 'Invalid children count' };
  if (adults + children > cfg.maxGuests) {
    return { error: `Maximum party size is ${cfg.maxGuests} guests` };
  }
  return { value: { checkIn, checkOut, adults, children } };
}

export function createBookingRouter(deps: {
  db: DatabaseService | null;
  requireAdminKey: RequestHandler;
}): Router {
  const router = express.Router();
  const { db, requireAdminKey } = deps;
  const beds24 = new Beds24Service();

  const availabilityLimiter = makeRateLimiter(30, 60_000); // 30/min/IP
  const checkoutLimiter = makeRateLimiter(10, 60_000);     // 10/min/IP

  function guardConfigured(res: any): boolean {
    if (!isBookingConfigured()) {
      res.status(503).json({ error: 'Booking is not available right now.' });
      return false;
    }
    if (!db) {
      res.status(503).json({ error: 'Booking storage is not available.' });
      return false;
    }
    return true;
  }

  // ─── Public config (deposit %, cancellation policy) ───────────────────────
  router.get('/config', requireAdminKey, (_req, res) => {
    const cfg = getBookingConfig();
    res.json({
      depositPercent: cfg.depositPercent,
      cancellationPolicyDays: cfg.cancellationPolicyDays,
      currency: beds24.getCurrency() || cfg.currency,
      configured: isBookingConfigured(),
    });
  });

  // ─── Availability + quote ──────────────────────────────────────────────────
  router.post('/availability', requireAdminKey, availabilityLimiter, async (req, res) => {
    if (!guardConfigured(res)) return;
    const parsed = parseStay(req.body);
    if (parsed.error || !parsed.value) return res.status(400).json({ error: parsed.error });
    const stay = parsed.value;

    const cfg = getBookingConfig();
    try {
      const quote = await beds24.getQuote(stay);
      const rooms = quote.rooms.map((r) => {
        const { deposit, balance } = splitDeposit(r.total, cfg.depositPercent);
        return {
          roomId: r.roomId,
          name: r.name,
          maxPeople: r.maxPeople,
          available: r.available,
          nights: r.nights,
          total: r.total,
          deposit,
          balance,
          currency: r.currency,
        };
      });
      res.json({
        checkIn: quote.checkIn,
        checkOut: quote.checkOut,
        nights: quote.nights,
        adults: quote.adults,
        children: quote.children,
        currency: quote.currency,
        depositPercent: cfg.depositPercent,
        cancellationPolicyDays: cfg.cancellationPolicyDays,
        rooms,
      });
    } catch (err: any) {
      const status = err instanceof Beds24Error ? err.status : 500;
      console.error('[BOOKING] availability error:', err.message);
      res.status(status).json({ error: 'Could not load availability. Please try again.' });
    }
  });

  // ─── Create Stripe checkout session ──────────────────────────────────────
  router.post('/checkout', requireAdminKey, checkoutLimiter, async (req, res) => {
    if (!guardConfigured(res)) return;
    const parsed = parseStay(req.body);
    if (parsed.error || !parsed.value) return res.status(400).json({ error: parsed.error });
    const stay = parsed.value;

    const roomId = String(req.body?.roomId || '').trim();
    const guest = req.body?.guest || {};
    const firstName = String(guest.firstName || '').trim().slice(0, 80);
    const lastName = String(guest.lastName || '').trim().slice(0, 80);
    const email = String(guest.email || '').trim().slice(0, 120);
    const phone = String(guest.phone || '').trim().slice(0, 40);
    const country = String(guest.country || '').trim().slice(0, 2).toUpperCase();
    const language = String(guest.language || 'EN').trim().slice(0, 5).toUpperCase();

    if (!roomId) return res.status(400).json({ error: 'Missing roomId' });
    if (!firstName) return res.status(400).json({ error: 'First name is required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'A valid email is required' });
    }

    const cfg = getBookingConfig();
    try {
      // Recompute price/availability server-side from a fresh Beds24 quote.
      const roomQuote = await beds24.getRoomQuote({ roomId, ...stay });
      if (!roomQuote) return res.status(404).json({ error: 'Room not found' });
      if (!roomQuote.available || roomQuote.total <= 0) {
        return res.status(409).json({ error: 'Sorry, that room is no longer available for those dates.' });
      }

      const { deposit, balance } = splitDeposit(roomQuote.total, cfg.depositPercent);
      const sessionRef = crypto.randomUUID();
      const currency = roomQuote.currency;

      await db!.createDirectBooking({
        sessionRef,
        roomId,
        roomName: roomQuote.name,
        checkInDate: stay.checkIn,
        checkOutDate: stay.checkOut,
        numAdults: stay.adults,
        numChildren: stay.children,
        guestFirstName: firstName,
        guestLastName: lastName || null,
        guestEmail: email,
        guestPhone: phone || null,
        guestCountry: country || null,
        guestLanguage: language,
        currency,
        totalAmount: roomQuote.total.toFixed(2),
        depositAmount: deposit.toFixed(2),
        balanceDue: balance.toFixed(2),
        depositPercent: cfg.depositPercent,
        paymentStatus: 'pending',
        status: 'pending',
      });

      const { url, stripeSessionId } = await createDepositCheckoutSession({
        sessionRef,
        depositAmount: deposit,
        currency,
        roomName: roomQuote.name,
        checkIn: stay.checkIn,
        checkOut: stay.checkOut,
        balanceDue: balance,
        guestEmail: email,
        locale: language.toLowerCase(),
      }, cfg);

      await db!.updateDirectBooking(sessionRef, { stripeSessionId });

      res.json({ url, sessionRef });
    } catch (err: any) {
      const status = err instanceof Beds24Error ? err.status : 500;
      console.error('[BOOKING] checkout error:', err.message);
      res.status(status).json({ error: 'Could not start checkout. Please try again.' });
    }
  });

  // ─── Stripe webhook (raw body, signature-verified) ────────────────────────
  router.post('/webhook', async (req, res) => {
    const cfg = getBookingConfig();
    let event;
    try {
      const raw = (req as any).rawBody || req.body;
      event = constructWebhookEvent(raw, req.headers['stripe-signature'] as string, cfg);
    } catch (err: any) {
      console.error('[BOOKING] webhook signature error:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Acknowledge fast; do the work but never throw back to Stripe past a 200
    // once the signature is valid (avoids endless retries on transient errors).
    try {
      if (event.type === 'checkout.session.completed') {
        await handleCheckoutCompleted(event.data.object as any);
      } else if (event.type === 'checkout.session.expired') {
        await handleSessionExpired(event.data.object as any);
      } else if (event.type === 'checkout.session.async_payment_failed') {
        await handlePaymentFailed(event.data.object as any);
      }
      res.json({ received: true });
    } catch (err: any) {
      console.error('[BOOKING] webhook handler error:', err.message);
      // Tell Stripe to retry so a transient Beds24/DB hiccup can self-heal.
      res.status(500).json({ error: 'Webhook processing failed' });
    }

    async function handleCheckoutCompleted(session: any) {
      if (!db) return;
      const sessionRef = session?.metadata?.sessionRef;
      const record = sessionRef
        ? await db.getDirectBookingByRef(sessionRef)
        : await db.getDirectBookingByStripeSession(session.id);
      if (!record) {
        console.warn('[BOOKING] webhook: no direct_booking for session', session.id);
        return;
      }
      if (record.status === 'confirmed' || record.status === 'sold_out_refunded') {
        return; // idempotent: already processed
      }

      const paymentIntentId =
        typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;

      await db.updateDirectBooking(record.sessionRef, {
        paymentStatus: 'paid',
        stripePaymentIntentId: paymentIntentId || null,
      });

      // Double-booking guard: re-check availability before confirming.
      let stillAvailable = false;
      try {
        const fresh = await beds24.getRoomQuote({
          roomId: record.roomId,
          checkIn: record.checkInDate,
          checkOut: record.checkOutDate,
          adults: record.numAdults,
          children: record.numChildren,
        });
        stillAvailable = Boolean(fresh?.available && fresh.total > 0);
      } catch (e: any) {
        console.error('[BOOKING] re-check availability failed:', e.message);
        stillAvailable = false;
      }

      if (!stillAvailable) {
        // Sold out in the payment window — refund the deposit automatically.
        // The refunded state must only be recorded if Stripe actually refunds;
        // otherwise the guest stays charged while our record says "refunded".
        if (!paymentIntentId) {
          // No payment intent to refund against — flag for manual handling and
          // let Stripe retry so a later event can carry the payment intent.
          await db.updateDirectBooking(record.sessionRef, {
            status: 'sold_out_refund_pending',
            paymentStatus: 'refund_pending',
            errorMessage: 'Room sold out before confirmation; refund pending (no payment intent on event).',
          });
          throw new Error(`Sold-out refund pending, missing payment intent for ${record.sessionRef}`);
        }
        try {
          await refundPaymentIntent(paymentIntentId, 'requested_by_customer', cfg);
        } catch (e: any) {
          // Refund failed: do NOT claim the guest was refunded. Persist a
          // pending state and return non-2xx so Stripe retries the webhook.
          console.error('[BOOKING] auto-refund failed:', e.message);
          await db.updateDirectBooking(record.sessionRef, {
            status: 'sold_out_refund_pending',
            paymentStatus: 'refund_pending',
            errorMessage: `Room sold out; auto-refund failed: ${e.message}`.slice(0, 500),
          });
          throw e; // let Stripe retry the webhook so the refund can self-heal
        }
        await db.updateDirectBooking(record.sessionRef, {
          status: 'sold_out_refunded',
          paymentStatus: 'refunded',
          errorMessage: 'Room sold out before confirmation; deposit refunded.',
        });
        console.warn('[BOOKING] sold out after payment, refunded:', record.sessionRef);
        return;
      }

      // Create the confirmed booking in Beds24 (PMS = source of truth downstream).
      try {
        const { beds24BookingId } = await beds24.createConfirmedBooking({
          roomId: record.roomId,
          checkIn: record.checkInDate,
          checkOut: record.checkOutDate,
          adults: record.numAdults,
          children: record.numChildren,
          firstName: record.guestFirstName,
          lastName: record.guestLastName || '',
          email: record.guestEmail,
          phone: record.guestPhone || '',
          country: record.guestCountry || '',
          total: Number(record.totalAmount),
          deposit: Number(record.depositAmount),
          balance: Number(record.balanceDue),
          currency: record.currency,
        });
        await db.updateDirectBooking(record.sessionRef, {
          status: 'confirmed',
          beds24BookingId,
        });
        console.log('[BOOKING] confirmed direct booking', record.sessionRef, '→ Beds24', beds24BookingId);
      } catch (e: any) {
        // Payment captured but Beds24 creation failed — flag for manual follow-up.
        await db.updateDirectBooking(record.sessionRef, {
          status: 'failed',
          errorMessage: `Beds24 creation failed: ${e.message}`.slice(0, 500),
        });
        console.error('[BOOKING] Beds24 creation failed after payment:', record.sessionRef, e.message);
        throw e; // let Stripe retry
      }
    }

    async function handleSessionExpired(session: any) {
      if (!db) return;
      const sessionRef = session?.metadata?.sessionRef;
      const record = sessionRef
        ? await db.getDirectBookingByRef(sessionRef)
        : await db.getDirectBookingByStripeSession(session.id);
      if (record && record.status === 'pending') {
        await db.updateDirectBooking(record.sessionRef, { paymentStatus: 'expired', status: 'failed' });
      }
    }

    async function handlePaymentFailed(session: any) {
      if (!db) return;
      const sessionRef = session?.metadata?.sessionRef;
      const record = sessionRef
        ? await db.getDirectBookingByRef(sessionRef)
        : await db.getDirectBookingByStripeSession(session.id);
      if (record && record.status === 'pending') {
        await db.updateDirectBooking(record.sessionRef, { paymentStatus: 'failed', status: 'failed' });
      }
    }
  });

  // ─── Result lookup for the confirmation page ─────────────────────────────
  router.get('/result/:sessionRef', requireAdminKey, async (req, res) => {
    if (!db) return res.status(503).json({ error: 'Booking storage is not available.' });
    const record = await db.getDirectBookingByRef(req.params.sessionRef);
    if (!record) return res.status(404).json({ error: 'Booking not found' });
    res.json({
      status: record.status,
      paymentStatus: record.paymentStatus,
      roomName: record.roomName,
      checkIn: record.checkInDate,
      checkOut: record.checkOutDate,
      adults: record.numAdults,
      children: record.numChildren,
      currency: record.currency,
      total: Number(record.totalAmount),
      deposit: Number(record.depositAmount),
      balanceDue: Number(record.balanceDue),
      guestFirstName: record.guestFirstName,
      guestEmail: record.guestEmail,
      beds24BookingId: record.beds24BookingId,
    });
  });

  return router;
}
