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
import nodemailer from 'nodemailer';
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
import { computeCartQuote, BookingCartError } from '../services/booking-cart';
import type { DirectBookingLeg } from '../../shared/schema';

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

  // ─── Best-effort ops alert (payment captured, no matching booking record) ──
  // This covers the one failure mode that leaves zero visible trace: Stripe
  // shows the charge, but nothing in our DB or Beds24 gets created, and the
  // only signal was a console.warn nobody was watching. Never let this email
  // attempt throw back into the webhook handler — Stripe's retry/ack logic
  // must depend only on the booking work succeeding, not on this notification.
  const alertTransporter =
    process.env.MAIL_HOST && process.env.IMAP_USER && process.env.IMAP_PASSWORD
      ? nodemailer.createTransport({
          host: process.env.MAIL_HOST,
          port: parseInt(process.env.SMTP_PORT || '465'),
          secure: true,
          auth: { user: process.env.IMAP_USER, pass: process.env.IMAP_PASSWORD },
        })
      : null;

  async function sendBookingAlert(subject: string, lines: string[]): Promise<void> {
    const body = lines.join('\n');
    if (!alertTransporter) {
      console.error('[BOOKING] alert email NOT sent (SMTP not configured):', subject, '|', body);
      return;
    }
    try {
      await alertTransporter.sendMail({
        from: `"${process.env.IMAP_FROM_NAME || 'DEVOCEAN Lodge Bookings'}" <${process.env.IMAP_FROM_EMAIL || 'booking@devoceanlodge.com'}>`,
        to: process.env.BOOKING_ALERT_EMAIL || 'reservations@devoceanlodge.com',
        subject: `⚠️ ${subject}`,
        text: body,
      });
    } catch (e: any) {
      console.error('[BOOKING] failed to send alert email:', e.message);
    }
  }

  const availabilityLimiter = makeRateLimiter(30, 60_000); // 30/min/IP
  const quoteLimiter = makeRateLimiter(40, 60_000);        // 40/min/IP (debounced live cart)
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
      // rules) for most offers, but last-minute rate plans are always 100% —
      // computed per-offer below, not blended across the whole search.
      const depositPercent = beds24.getDepositPercentForArrival(stay.checkIn);

      const rooms = result.rooms.map((r) => ({
        roomId: r.roomId,
        name: r.name,
        maxPeople: r.maxPeople,
        maxAdults: r.maxAdults,
        maxChildren: r.maxChildren,
        available: r.available,
        unitsAvailable: r.unitsAvailable,
        nights: r.nights,
        currency: r.currency,
        offers: r.offers.map((o) => {
          const offerDepositPercent = beds24.getDepositPercentForOffer(stay.checkIn, o.type);
          const { deposit, balance } = splitDeposit(o.total, offerDepositPercent);
          return {
            offerId: o.offerId,
            offerName: o.offerName,
            type: o.type,
            refundable: o.refundable,
            total: o.total,
            depositPercent: offerDepositPercent,
            deposit,
            balance,
            unitsAvailable: o.unitsAvailable,
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
        maxRooms: getBookingConfig().maxRooms,
        rooms,
      });
    } catch (err: any) {
      const status = err instanceof Beds24Error ? err.status : 500;
      console.error('[BOOKING] availability error:', err.message);
      res.status(status).json({ error: 'Could not load availability. Please try again.' });
    }
  });

  // ─── Live cart quote (per-type cart → combined price/deposit) ──────────────
  // Drives the debounced cart preview on /book-direct. Recomputes everything
  // server-side from fresh Beds24 offers; never trusts client amounts.
  router.post('/quote', requireAdminKey, quoteLimiter, async (req, res) => {
    if (!guardConfigured(res)) return;
    const parsed = parseStay(req.body);
    if (parsed.error || !parsed.value) return res.status(400).json({ error: parsed.error });
    const stay = parsed.value;
    const cartLines = Array.isArray(req.body?.rooms) ? req.body.rooms : [];

    try {
      const quote = await computeCartQuote(beds24, stay, cartLines, getBookingConfig());
      res.json({
        checkIn: quote.checkIn,
        checkOut: quote.checkOut,
        nights: quote.nights,
        adults: quote.adults,
        children: quote.children,
        currency: quote.currency,
        depositPercent: quote.depositPercent,
        cancellationPolicyDays: quote.cancellationPolicyDays,
        total: quote.total,
        deposit: quote.deposit,
        balance: quote.balance,
        rooms: quote.rooms,
        lines: quote.lines,
      });
    } catch (err: any) {
      const isCart = err instanceof BookingCartError;
      const status = isCart ? err.status : err instanceof Beds24Error ? err.status : 500;
      if (!isCart) console.error('[BOOKING] quote error:', err.message);
      res.status(status).json({
        error: isCart ? err.message : 'Could not price your selection. Please try again.',
        code: isCart ? err.code : undefined,
      });
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

    // Cart: prefer the multi-room `rooms:[{roomId,offerId,qty}]` shape; fall back
    // to a single-room `roomId`/`offerId` for backward compatibility.
    let cartLines = req.body?.rooms;
    if (!Array.isArray(cartLines) || cartLines.length === 0) {
      const roomId = String(req.body?.roomId || '').trim();
      cartLines = roomId ? [{ roomId, offerId: req.body?.offerId ?? null, qty: 1 }] : [];
    }

    const guest = req.body?.guest || {};
    const firstName = String(guest.firstName || '').trim().slice(0, 80);
    const lastName = String(guest.lastName || '').trim().slice(0, 80);
    const email = String(guest.email || '').trim().slice(0, 120);
    const phone = String(guest.phone || '').trim().slice(0, 40);
    const country = String(guest.country || '').trim().slice(0, 2).toUpperCase();
    const language = String(guest.language || 'EN').trim().slice(0, 5).toUpperCase();

    // GA4 attribution: the visitor's client_id (or "fb." fallback) captured
    // browser-side. Stored on the pending booking so the email-ingest path can
    // attribute the confirmed booking with the exact session + revenue.
    const rawGaClientId = req.body?.gaClientId;
    const gaClientId =
      typeof rawGaClientId === 'string' && rawGaClientId.length > 0 && rawGaClientId.length <= 64
        ? rawGaClientId
        : null;

    if (!firstName) return res.status(400).json({ error: 'First name is required' });
    if (!lastName) return res.status(400).json({ error: 'Last name is required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'A valid email is required' });
    }
    if (!phone) return res.status(400).json({ error: 'Phone is required' });

    const cfg = getBookingConfig();
    const t0 = Date.now();
    try {
      console.log(
        `[BOOKING] checkout: start ${stay.checkIn}->${stay.checkOut} lines=${cartLines.length}`,
      );
      // Recompute everything (occupancy split, per-leg price, combined deposit)
      // server-side from fresh Beds24 offers. Client amounts are never trusted —
      // only roomId/offerId/qty select WHAT to price.
      const quote = await computeCartQuote(beds24, stay, cartLines, cfg);
      const first = quote.legs[0];
      const summary = quote.lines
        .map((l) => (l.qty > 1 ? `${l.roomName} \u00d7${l.qty}` : l.roomName))
        .join(', ');
      console.log(
        `[BOOKING] checkout: quote ok (${Date.now() - t0}ms) ${summary} ${quote.total} ${quote.currency}`,
      );

      const sessionRef = crypto.randomUUID();

      await db!.createDirectBooking({
        sessionRef,
        roomId: first.roomId,                 // first leg (scalar back-compat)
        roomName: summary,                    // combined human summary
        offerId: first.offerId,
        offerName: first.offerName,
        checkInDate: stay.checkIn,
        checkOutDate: stay.checkOut,
        numAdults: stay.adults,               // whole-party totals
        numChildren: stay.children,
        guestFirstName: firstName,
        guestLastName: lastName || null,
        guestEmail: email,
        guestPhone: phone || null,
        guestCountry: country || null,
        guestLanguage: language,
        gaClientId,
        currency: quote.currency,
        totalAmount: quote.total.toFixed(2),
        depositAmount: quote.deposit.toFixed(2),
        balanceDue: quote.balance.toFixed(2),
        depositPercent: quote.depositPercent,
        legs: quote.legs,                     // per-room source of truth
        paymentStatus: 'pending',
        status: 'pending',
      });
      console.log(`[BOOKING] checkout: row created ${sessionRef} (${Date.now() - t0}ms)`);

      const tStripe = Date.now();
      const { url, stripeSessionId } = await createDepositCheckoutSession({
        sessionRef,
        depositAmount: quote.deposit,
        currency: quote.currency,
        roomName: summary,
        checkIn: stay.checkIn,
        checkOut: stay.checkOut,
        balanceDue: quote.balance,
        guestEmail: email,
        locale: language.toLowerCase(),
      }, cfg);
      console.log(
        `[BOOKING] checkout: stripe session ok ${sessionRef} (stripe ${Date.now() - tStripe}ms)`,
      );

      await db!.updateDirectBooking(sessionRef, { stripeSessionId });

      res.json({ url, sessionRef });
    } catch (err: any) {
      const isCart = err instanceof BookingCartError;
      const status = isCart ? err.status : err instanceof Beds24Error ? err.status : 500;
      if (!isCart) console.error('[BOOKING] checkout error:', err.message);
      res.status(status).json({
        error: isCart ? err.message : 'Could not start checkout. Please try again.',
        code: isCart ? err.code : undefined,
      });
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

    // Build the per-room legs to confirm. For carts this is the persisted
    // `legs` JSONB; for legacy single-room rows it's synthesized from the scalar
    // columns so old pending sessions still confirm correctly.
    function legsFromRecord(record: any): DirectBookingLeg[] {
      if (Array.isArray(record.legs) && record.legs.length) {
        return record.legs.map((l: DirectBookingLeg) => ({ ...l }));
      }
      return [{
        roomId: record.roomId,
        roomName: record.roomName || 'Room',
        offerId: record.offerId ?? null,
        offerName: record.offerName ?? null,
        adults: record.numAdults,
        children: record.numChildren,
        total: Number(record.totalAmount),
        deposit: Number(record.depositAmount),
        balance: Number(record.balanceDue),
        beds24BookingId: record.beds24BookingId ?? null,
      }];
    }

    // Schedule the guest transactional emails (post-booking confirmation,
    // pre-arrival, arrival, post-departure) ONCE for the whole booking group.
    // Beds24 does NOT send a notification email for bookings created via its
    // REST API, so the usual IMAP-ingest path never fires for direct bookings.
    // Idempotent: createManualBooking throws "already exists" once the group is
    // present (e.g. on a webhook retry), which we treat as success. The first
    // leg's Beds24 id is the group ref; every leg id is passed as a booking ref.
    async function scheduleGuestEmails(record: any, legs: DirectBookingLeg[]) {
      if (!emailService) return;
      const ids = legs.map((l) => l.beds24BookingId).filter(Boolean).map(String);
      if (ids.length === 0) return;
      try {
        const fullName = `${record.guestFirstName} ${record.guestLastName || ''}`.trim();
        await emailService.createManualBooking({
          groupRef: ids[0],
          bookingRefs: ids,
          guestName: fullName,
          firstName: record.guestFirstName,
          guestEmail: record.guestEmail,
          guestLanguage: record.guestLanguage || 'EN',
          guestCountry: record.guestCountry || undefined,
          checkInDate: record.checkInDate,
          checkOutDate: record.checkOutDate,
        });
        console.log('[BOOKING] scheduled guest emails for direct booking', record.sessionRef);
      } catch (e: any) {
        if (String(e?.message || '').includes('already exists')) return; // already scheduled
        console.error('[BOOKING] email scheduling failed for', record.sessionRef, e.message);
        throw e; // let Stripe retry; the confirmed-retry branch re-attempts
      }
    }

    // Re-quote the whole cart from fresh Beds24 offers at webhook time — the
    // documented "recompute at webhook" guard. computeCartQuote re-validates
    // availability + units (throwing BookingCartError on any sell-out / capacity
    // loss) AND recomputes the authoritative price, so one call both guards the
    // sell-out case and lets us detect rate drift. The cart lines are rebuilt
    // from the persisted per-leg occupancy (qty per roomId+offer), mirroring how
    // checkout priced it; distributeGuests is deterministic, so the fresh legs
    // line up 1:1 with the stored ones. Throws (BookingCartError on sell-out,
    // Beds24Error on a transient upstream failure) — the caller decides.
    async function recheckCartQuote(record: any, legs: DirectBookingLeg[]) {
      const lineMap = new Map<string, { roomId: string; offerId: number | null; qty: number }>();
      for (const leg of legs) {
        const key = `${leg.roomId}__${leg.offerId ?? 'any'}`;
        const existing = lineMap.get(key);
        if (existing) existing.qty += 1;
        else lineMap.set(key, { roomId: leg.roomId, offerId: leg.offerId ?? null, qty: 1 });
      }
      return computeCartQuote(
        beds24,
        {
          checkIn: record.checkInDate,
          checkOut: record.checkOutDate,
          adults: record.numAdults,
          children: record.numChildren,
        },
        Array.from(lineMap.values()),
        cfg,
      );
    }

    async function refundSoldOut(record: any, paymentIntentId: string | undefined) {
      // The refunded state must only be recorded if Stripe actually refunds;
      // otherwise the guest stays charged while our record says "refunded".
      if (!paymentIntentId) {
        await db!.updateDirectBooking(record.sessionRef, {
          status: 'sold_out_refund_pending',
          paymentStatus: 'refund_pending',
          errorMessage: 'Room sold out before confirmation; refund pending (no payment intent on event).',
        });
        throw new Error(`Sold-out refund pending, missing payment intent for ${record.sessionRef}`);
      }
      try {
        await refundPaymentIntent(paymentIntentId, 'requested_by_customer', cfg);
      } catch (e: any) {
        console.error('[BOOKING] auto-refund failed:', e.message);
        await db!.updateDirectBooking(record.sessionRef, {
          status: 'sold_out_refund_pending',
          paymentStatus: 'refund_pending',
          errorMessage: `Room sold out; auto-refund failed: ${e.message}`.slice(0, 500),
        });
        throw e; // let Stripe retry the webhook so the refund can self-heal
      }
      await db!.updateDirectBooking(record.sessionRef, {
        status: 'sold_out_refunded',
        paymentStatus: 'refunded',
        errorMessage: 'Room sold out before confirmation; deposit refunded.',
      });
      console.warn('[BOOKING] sold out after payment, refunded:', record.sessionRef);
    }

    async function handleCheckoutCompleted(session: any) {
      if (!db) return;
      const sessionRef = session?.metadata?.sessionRef;
      const record0 = sessionRef
        ? await db.getDirectBookingByRef(sessionRef)
        : await db.getDirectBookingByStripeSession(session.id);
      if (!record0) {
        console.warn('[BOOKING] webhook: no direct_booking for session', session.id);
        const pi =
          typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
        await sendBookingAlert('Stripe payment captured with no matching booking record', [
          'A guest was charged via Stripe but no direct_bookings row was found for this checkout session.',
          'No Beds24 booking was created automatically — this needs a manual follow-up.',
          '',
          `Stripe checkout session: ${session.id}`,
          `sessionRef (metadata): ${sessionRef || 'MISSING'}`,
          `Payment intent: ${pi || 'unknown'}`,
          `Customer email: ${session.customer_details?.email || session.customer_email || 'unknown'}`,
          `Amount: ${session.amount_total != null ? (session.amount_total / 100).toFixed(2) : '?'} ${(session.currency || '').toUpperCase()}`,
          '',
          'Check the Stripe Dashboard for full payment details, create the Beds24 booking manually, and follow up with the guest.',
        ]);
        return;
      }
      if (record0.status === 'sold_out_refunded') return; // already refunded, nothing to do

      // Already fully confirmed: a prior delivery created the Beds24 bookings.
      // Skip re-creation (avoids duplicates) and just (re)schedule emails.
      if (record0.status === 'confirmed') {
        await scheduleGuestEmails(record0, legsFromRecord(record0));
        return;
      }

      const paymentIntentId =
        typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;

      // Atomically claim the row for processing. Only the single winner proceeds;
      // concurrent deliveries / fast retries get false and bail, so legs are
      // never double-created. (Stale-processing > 2 min and refund-pending rows
      // are re-claimable so a crashed/half-done attempt self-heals on retry.)
      const claimed = await db.claimDirectBookingForProcessing(record0.sessionRef, paymentIntentId || null);
      if (!claimed) {
        console.warn('[BOOKING] webhook: could not claim (concurrent/terminal state)', record0.sessionRef);
        return;
      }

      // Re-read post-claim for the freshest legs + payment intent.
      const record = await db.getDirectBookingByRef(record0.sessionRef);
      if (!record) return;
      const legs = legsFromRecord(record);

      // Recompute + sell-out guard. Only refund if NOTHING has been created yet —
      // a retry resuming a partial create must NOT refund (rooms already exist in
      // Beds24). A fresh server-side re-quote runs here (never trusting stored or
      // client amounts to confirm availability): BookingCartError means a real
      // sell-out / capacity loss → auto-refund, while a transient Beds24/upstream
      // failure must NOT refund a paying guest — we rethrow so Stripe retries.
      const anyCreated = legs.some((l) => l.beds24BookingId);
      if (!anyCreated) {
        let fresh;
        try {
          fresh = await recheckCartQuote(record, legs);
        } catch (e: any) {
          if (e instanceof BookingCartError) {
            await refundSoldOut(record, paymentIntentId);
            return;
          }
          console.error('[BOOKING] webhook re-quote failed (will retry):', e.message);
          throw e; // transient upstream error — let Stripe retry instead of refunding
        }
        // The guest is charged the amount quoted + paid at checkout (stored on the
        // legs). The fresh re-quote above guards the sell-out case; here it only
        // surfaces any Beds24 rate drift during the payment window for the operator
        // — we honor the checkout price the guest actually agreed to and paid on.
        const storedTotal = legs.reduce((s, l) => s + l.total, 0);
        if (Math.abs(fresh.total - storedTotal) > 0.01) {
          console.warn(
            `[BOOKING] price drift at webhook for ${record.sessionRef}: ` +
              `checkout ${storedTotal.toFixed(2)} vs fresh ${fresh.total.toFixed(2)} ${record.currency}; ` +
              `honoring checkout price.`,
          );
        }
      }

      // Create each not-yet-created leg in Beds24 (PMS = source of truth),
      // persisting its id immediately so a crash/retry resumes from here and
      // never re-creates a confirmed room.
      for (let i = 0; i < legs.length; i++) {
        const leg = legs[i];
        if (leg.beds24BookingId) continue;
        try {
          const { beds24BookingId } = await beds24.createConfirmedBooking({
            roomId: leg.roomId,
            checkIn: record.checkInDate,
            checkOut: record.checkOutDate,
            adults: leg.adults,
            children: leg.children,
            firstName: record.guestFirstName,
            lastName: record.guestLastName || '',
            email: record.guestEmail,
            phone: record.guestPhone || '',
            country: record.guestCountry || '',
            total: leg.total,
            deposit: leg.deposit,
            balance: leg.balance,
            currency: record.currency,
            offerId: leg.offerId,
            offerName: leg.offerName,
          });
          leg.beds24BookingId = beds24BookingId;
          await db.updateDirectBooking(record.sessionRef, {
            legs,
            beds24BookingId: legs[0].beds24BookingId || beds24BookingId, // first-leg id (scalar back-compat)
          });
        } catch (e: any) {
          // Payment captured but a leg failed — persist progress + flag for
          // follow-up, then let Stripe retry (failed rows are re-claimable and
          // already-created legs are skipped above).
          await db.updateDirectBooking(record.sessionRef, {
            legs,
            status: 'failed',
            errorMessage: `Beds24 creation failed on room ${i + 1}/${legs.length}: ${e.message}`.slice(0, 500),
          });
          console.error('[BOOKING] Beds24 creation failed after payment:', record.sessionRef, e.message);
          throw e; // let Stripe retry
        }
      }

      // All legs created → confirm.
      await db.updateDirectBooking(record.sessionRef, {
        status: 'confirmed',
        legs,
        beds24BookingId: legs[0].beds24BookingId || null,
      });
      console.log(
        '[BOOKING] confirmed direct booking', record.sessionRef,
        '→ Beds24', legs.map((l) => l.beds24BookingId).join(','),
      );

      // Schedule the guest emails once; a failure here throws so Stripe retries
      // and the confirmed-retry branch re-attempts scheduling without re-creating.
      await scheduleGuestEmails(record, legs);
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
      legs: Array.isArray(record.legs)
        ? record.legs.map((l) => ({
            roomName: l.roomName,
            offerName: l.offerName,
            adults: l.adults,
            children: l.children,
            total: l.total,
            deposit: l.deposit,
            balance: l.balance,
            beds24BookingId: l.beds24BookingId,
          }))
        : null,
    });
  });

  return router;
}
