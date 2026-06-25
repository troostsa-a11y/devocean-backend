---
name: Beds24 API-created bookings send no notification email
description: Why direct-booking guest emails must be scheduled explicitly, not via the IMAP path
---

# Beds24 REST-API bookings do not trigger notification emails

Beds24 sends its booking-notification email only for bookings made through its own
channels (iframe, OTA sync, manual). Bookings created via the Beds24 **REST API**
(the native `/book-direct` deposit flow) do **not** generate that email.

**Why this matters:** the email-automation service learns about bookings by
ingesting Beds24's notification email over IMAP (`email-automation.ts` /
`email-parser.ts`). Since API-created bookings never produce that email, the
IMAP pipeline never fires for direct bookings — guests would get no confirmation,
pre-arrival, arrival, or post-departure emails. (Verified live: a paid test
booking created the Beds24 reservation but no `bookings` guest row, and a forced
`/api/check-emails` produced nothing.)

**How to apply:** the direct-booking Stripe webhook
(`server/routes/booking.ts` → `handleCheckoutCompleted`) must schedule the guest
emails itself by calling `emailService.createManualBooking(...)` after the Beds24
booking is confirmed. Keep it idempotent + retriable:
- mark `direct_bookings.status = 'confirmed'` right after Beds24 creation (guards
  against duplicate Beds24 bookings on Stripe webhook retries);
- a webhook retry where status is already `confirmed` must skip Beds24 re-creation
  and re-attempt email scheduling;
- `createManualBooking` throws `"already exists"` once the `bookings` row exists —
  treat that as success; any other scheduling error should throw so Stripe retries.

**Known gap (not yet built):** GA4 `purchase` conversion also depended on the IMAP
path, so it does not fire for direct bookings.
