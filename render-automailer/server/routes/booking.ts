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

// Minimal structural type for the email automation service so the booking
// router can schedule guest emails without importing the whole service.
interface EmailScheduler {
  createManualBooking(data: {
    groupRef: string;
    bookingRefs?: string[];
    guestName: string;
    firstName: string;
    guestGender?: 'male' | 'female' | null;
    guestEmail: string;
    guestLanguage: string;
    guestCountry?: string;
    checkInDate: string;
    checkOutDate: string;
  }): Promise<{ booking: any; scheduledEmails: any[] }>;
}

export function createBookingRouter(deps: {
  db: DatabaseService | null;
  requireAdminKey: RequestHandler;
  emailService?: EmailScheduler | null;
}): Router {
  const router = express.Router();
  const { db, requireAdminKey, emailService } = deps;
  const beds24 = new Beds24Service();

  const availabilityLimiter = makeRateLimiter(30, 60_000); // 30/min/IP
  const checkoutLimiter = makeRateLimiter(10, 60_000);     // 10/min/IP
  const calendarLimiter = makeRateLimiter(20, 60_000);     // 20/min/IP

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

    try {
      const result = await beds24.getAvailability(stay);
      // Deposit % depends on the arrival date (Beds24 near-arrival / exceptional
      // rules), so it is the same for every room/offer in this search.
      const depositPercent = beds24.getDepositPercentForArrival(stay.checkIn);

      const rooms = result.rooms.map((r) => ({
        roomId: r.roomId,
        name: r.name,
        maxPeople: r.maxPeople,
        available: r.available,
        nights: r.nights,
        currency: r.currency,
        offers: r.offers.map((o) => {
          const { deposit, balance } = splitDeposit(o.total, depositPercent);
          return {
            offerId: o.offerId,
            offerName: o.offerName,
            type: o.type,
            refundable: o.refundable,
            total: o.total,
            deposit,
            balance,
          };
        }),
      }));

      res.json({
        checkIn: result.checkIn,
        checkOut: result.checkOut,
        nights: result.nights,
        adults: result.adults,
        children: result.children,
        currency: result.currency,
        depositPercent,
        cancellationPolicyDays: beds24.getCancellationDays(),
        rooms,
      });
    } catch (err: any) {
      const status = err instanceof Beds24Error ? err.status : 500;
      console.error('[BOOKING] availability error:', err.message);
      res.status(status).json({ error: 'Could not load availability. Please try again.' });
    }
  });

  // ─── Per-date price calendar (drives the picker's rate-tier colouring) ─────
  // Only needs Beds24 (no db/Stripe), so it is not behind guardConfigured; an
  // unconfigured Beds24 surfaces as a 503 via Beds24Error.
  router.get('/calendar', requireAdminKey, calendarLimiter, async (req, res) => {
    const startRaw = String(req.query.startDate || '');
    const endRaw = String(req.query.endDate || '');
    if (!isValidDate(startRaw) || !isValidDate(endRaw)) {
      return res.status(400).json({ error: 'Invalid startDate/endDate (expected YYYY-MM-DD)' });
    }
    // Floor the start to today and clamp the span to the picker's nav horizon.
    const today = todayUTC();
    const startDate = startRaw < today ? today : startRaw;
    if (endRaw <= startDate) {
      return res.status(400).json({ error: 'endDate must be after startDate' });
    }
    const maxEnd = new Date(new Date(`${startDate}T00:00:00Z`).getTime() + 760 * 86_400_000)
      .toISOString().slice(0, 10);
    const endDate = endRaw > maxEnd ? maxEnd : endRaw;

    try {
      const result = await beds24.getPriceCalendar({ startDate, endDate });
      res.json(result);
    } catch (err: any) {
      const status = err instanceof Beds24Error ? err.status : 500;
      console.error('[BOOKING] calendar error:', err.message);
      res.status(status).json({ error: 'Could not load the rate calendar.' });
    }
  });

  // ─── Create Stripe checkout session ──────────────────────────────────────
  router.post('/checkout', requireAdminKey, checkoutLimiter, async (req, res) => {
    if (!guardConfigured(res)) return;
    const parsed = parseStay(req.body);
    if (parsed.error || !parsed.value) return res.status(400).json({ error: parsed.error });
    const stay = parsed.value;

    const roomId = String(req.body?.roomId || '').trim();
    const offerId = Number.parseInt(req.body?.offerId, 10);
    const guest = req.body?.guest || {};
    const firstName = String(guest.firstName || '').trim().slice(0, 80);
    const lastName = String(guest.lastName || '').trim().slice(0, 80);
    const email = String(guest.email || '').trim().slice(0, 120);
    const phone = String(guest.phone || '').trim().slice(0, 40);
    const country = String(guest.country || '').trim().slice(0, 2).toUpperCase();
    const language = String(guest.language || 'EN').trim().slice(0, 5).toUpperCase();

    if (!roomId) return res.status(400).json({ error: 'Missing roomId' });
    if (!Number.isFinite(offerId)) return res.status(400).json({ error: 'Missing rate plan' });
    if (!firstName) return res.status(400).json({ error: 'First name is required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'A valid email is required' });
    }

    const cfg = getBookingConfig();
    try {
      // Recompute price/availability server-side from fresh Beds24 offers and
      // re-select the exact rate plan the guest chose. Client amounts are never
      // trusted — only the offerId is used to look up the live price.
      const roomOffers = await beds24.getRoomOffers({ roomId, ...stay });
      if (!roomOffers) return res.status(404).json({ error: 'Room not found' });
      const offer = roomOffers.offers.find((o) => o.offerId === offerId);
      if (!roomOffers.available || !offer || offer.total <= 0) {
        return res.status(409).json({ error: 'Sorry, that rate is no longer available for those dates.' });
      }

      const depositPercent = beds24.getDepositPercentForArrival(stay.checkIn);
      const { deposit, balance } = splitDeposit(offer.total, depositPercent);
      const sessionRef = crypto.randomUUID();
      const currency = roomOffers.currency;

      await db!.createDirectBooking({
        sessionRef,
        roomId,
        roomName: roomOffers.name,
        offerId: offer.offerId,
        offerName: offer.offerName || null,
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
        totalAmount: offer.total.toFixed(2),
        depositAmount: deposit.toFixed(2),
        balanceDue: balance.toFixed(2),
        depositPercent,
        paymentStatus: 'pending',
        status: 'pending',
      });

      const { url, stripeSessionId } = await createDepositCheckoutSession({
        sessionRef,
        depositAmount: deposit,
        currency,
        roomName: roomOffers.name,
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
      if (record.status === 'sold_out_refunded') return; // already refunded, nothing to do

      // Schedule the guest transactional emails (post-booking confirmation,
      // pre-arrival, arrival, post-departure). Beds24 does NOT send a
      // notification email for bookings created via its REST API, so the usual
      // IMAP-ingest path never fires for direct bookings — we must schedule
      // them here. Idempotent: createManualBooking throws "already exists" once
      // the bookings row is present (e.g. on a webhook retry), which we treat
      // as success.
      async function scheduleGuestEmails(beds24BookingId: string) {
        if (!emailService) return;
        try {
          const fullName = `${record!.guestFirstName} ${record!.guestLastName || ''}`.trim();
          await emailService.createManualBooking({
            groupRef: String(beds24BookingId),
            bookingRefs: [String(beds24BookingId)],
            guestName: fullName,
            firstName: record!.guestFirstName,
            guestEmail: record!.guestEmail,
            guestLanguage: record!.guestLanguage || 'EN',
            guestCountry: record!.guestCountry || undefined,
            checkInDate: record!.checkInDate,
            checkOutDate: record!.checkOutDate,
          });
          console.log('[BOOKING] scheduled guest emails for direct booking', record!.sessionRef);
        } catch (e: any) {
          if (String(e?.message || '').includes('already exists')) return; // already scheduled
          // Payment + Beds24 booking are already done, but scheduling failed.
          // Throw so Stripe retries the webhook; the confirmed-retry branch
          // below re-attempts scheduling without re-creating the Beds24 booking.
          console.error('[BOOKING] email scheduling failed for', record!.sessionRef, e.message);
          throw e;
        }
      }

      // Retry path: a previous webhook delivery already confirmed the booking
      // but may not have scheduled the emails (e.g. a transient failure). Skip
      // Beds24 re-creation (avoids duplicates) and just (re)schedule emails.
      if (record.status === 'confirmed') {
        if (record.beds24BookingId) await scheduleGuestEmails(record.beds24BookingId);
        return;
      }

      const paymentIntentId =
        typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;

      await db.updateDirectBooking(record.sessionRef, {
        paymentStatus: 'paid',
        stripePaymentIntentId: paymentIntentId || null,
      });

      // Double-booking guard: re-check availability for the chosen rate plan
      // before confirming. The guest is charged the amount quoted at checkout
      // (stored on the record); this check only guards against a sell-out.
      let stillAvailable = false;
      try {
        const fresh = await beds24.getRoomOffers({
          roomId: record.roomId,
          checkIn: record.checkInDate,
          checkOut: record.checkOutDate,
          adults: record.numAdults,
          children: record.numChildren,
        });
        const offerStillThere =
          record.offerId == null ||
          Boolean(fresh?.offers.some((o) => o.offerId === record.offerId));
        stillAvailable = Boolean(fresh?.available && fresh.offers.length > 0 && offerStillThere);
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
      let confirmedBeds24Id: string;
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
          offerId: record.offerId,
          offerName: record.offerName,
        });
        confirmedBeds24Id = beds24BookingId;
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

      // Booking is now safely confirmed (it won't be re-created on a retry).
      // Schedule the guest emails; a failure here throws so Stripe retries and
      // the confirmed-retry branch above re-attempts scheduling.
      await scheduleGuestEmails(confirmedBeds24Id);
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
    const record = await db.getDirectBookingByRef(String(req.params.sessionRef));
    if (!record) return res.status(404).json({ error: 'Booking not found' });
    res.json({
      status: record.status,
      paymentStatus: record.paymentStatus,
      roomName: record.roomName,
      offerName: record.offerName,
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
