---
name: Stripe webhook payment-captured-but-no-booking alert
description: Why the direct-booking webhook now emails an ops alert when a completed Stripe session has no matching direct_bookings row
---

The native `/book-direct` Stripe webhook handler silently `console.warn`'d and returned when a `checkout.session.completed` event had no matching `direct_bookings` row, instead of alerting anyone. Because the Stripe Dashboard webhook endpoint itself was never actually registered after the flow was built (only tested via a temporary `stripe listen` CLI session during dev), every completed checkout since then silently vanished — Stripe captured payment, but no Beds24 booking, no DB row, no log anyone was watching. A real guest deposit was captured with zero trace until the guest followed up directly.

**Why:** A payment-critical webhook must have a fail-safe notification path that doesn't depend on anyone proactively reading server logs or the DB. Console logs alone are not an acceptable alerting mechanism for "guest was charged, nothing happened."

**How to apply:** `handleCheckoutCompleted`'s `if (!record0)` branch in `render-automailer/server/routes/booking.ts` now calls `sendBookingAlert(...)`, a best-effort nodemailer send (reuses `MAIL_HOST`/`IMAP_USER`/`IMAP_PASSWORD`) to `BOOKING_ALERT_EMAIL` (default `reservations@devoceanlodge.com`), with the Stripe session id, sessionRef, payment intent, customer email, and amount. The send is wrapped so it can never throw back into the webhook handler — an alert-email failure must never affect Stripe's retry/ack behavior for the actual booking logic. Other failure branches (Beds24 creation failure, sold-out refund) already persist `status: 'failed'`/`errorMessage` to the DB, so they have a trace but are not (yet) proactively alerted — apply the same pattern there if that gap matters later.

Separately: whenever a new Stripe webhook-dependent flow ships, verify a **persistent Dashboard endpoint** exists (Developers → Webhooks) — a `stripe listen` dev session proves the code works but leaves no production endpoint behind.
