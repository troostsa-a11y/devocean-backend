---
name: GA4 attribution architecture
description: How confirmed bookings fire a server-side GA4 Measurement Protocol purchase, post-iframe (native /book-direct is the sole booking path)
---

# GA4 Measurement Protocol Attribution

## Why server-side at all
GA4 client-side can record intent but never a reliable `purchase` for these
bookings: payment/confirmation happen off the React app (Beds24 PMS + Stripe),
and direct bookings are confirmed by a Stripe webhook the browser never sees. So
the `purchase` event is fired **server-side** from the automailer when a booking
row is created.

## Single attribution hook for BOTH booking paths
All attribution is centralized in one helper:
`EmailAutomationService.attributeBooking(booking)`. It is called from BOTH
booking-creation paths and fires at most once per booking:
1. **Native `/book-direct`** — the Stripe webhook confirms the Beds24 legs, marks
   `direct_bookings.status='confirmed'` (with per-leg Beds24 ids persisted), then
   calls `createManualBooking()`, which calls `attributeBooking()`. This is the
   single fire point for native bookings — Beds24 sends NO email for REST-API
   bookings, so the IMAP loop never sees them (see `beds24-api-no-emails.md`).
2. **Legacy / OTA emailed bookings** — the IMAP loop creates the booking via
   `createBooking()` then calls `attributeBooking()`.

**Why centralized:** the original hook lived only in the IMAP loop, so native
direct bookings (the sole live booking path now that the Beds24 iframe is gone)
fired zero conversions. Putting it in one helper called from both paths is the fix.

## Resolution order inside attributeBooking()
1. **Exact** — if a confirmed, not-yet-fired, recent `direct_bookings` row matches
   (Beds24 id first, then `lower(email)`+check-in date) AND has a REAL `_ga`
   client id (not an `fb.` fallback): fire `purchase` with real `value` (booking
   total), `currency`, and `deposit`; stamp `ga4_conversion_fired_at` only on a
   successful send. On a transient/config MP failure with a real id, leave it
   UNSTAMPED (no automatic retry sweep exists, but don't record a failed send as
   fired). transaction_id = `direct_<sessionRef>` (dedupes multi-room).
2. **Fallback** — no direct row, or only an `fb.` fallback id: try the legacy
   `matchBookingSession(language, country)` 30-min heuristic (a delayed real `_ga`
   capture via `trackBookingSession()` can still have recorded a session). Send
   real revenue from the direct row when present, then stamp the direct row fired.

## Single-fire guarantees
- `ga4_conversion_fired_at` (NOT NULL ⇒ excluded from the candidate pool).
- `createManualBooking()` throws `"already exists"` on Stripe webhook retries
  before reaching attribution, so it fires once.
- Direct bookings never traverse IMAP, so the two paths don't overlap.

## Required env vars (set before automailer deploy)
**Render:** `GA4_MEASUREMENT_ID` (e.g. `G-XXXXXXXXXX`), `GA4_API_SECRET`
(GA4 > Admin > Data Streams > Measurement Protocol API secrets). Without these the
matching still runs but the MP POST is skipped.
**Cloudflare Pages:** `AUTOMAILER_URL` (in `wrangler.toml [vars]`), `ADMIN_API_KEY`
(uploaded via `wrangler pages secret put` inside `deploy.sh` — never via the CF
dashboard, which is locked when `wrangler.toml` exists).

## Required DB migrations (run on prod Supabase before deploying)
- `migrations/add_booking_sessions.sql` — `booking_sessions` (fallback heuristic).
- `migrations/add_ga_attribution_to_direct_bookings.sql` — adds
  `direct_bookings.ga_client_id` + `ga4_conversion_fired_at` + attribution index.
Both are also self-healed idempotently at startup (`initDirectBookingsTable()` for
the direct-booking columns), but run the SQL explicitly for auditability.

## Fallback client_id pattern (`fb.` prefix)
GTM is deferred until first interaction (keeps Lighthouse TBT clean). The booking
CTA IS that first interaction; GA4 writes `_ga` ~300–800 ms later. The checkout
captures the best id available (`getBookingAttributionId()` = real `_ga` cid or an
`fb.<ts>.<rand>` sessionStorage fallback). `fireGA4Conversion()` skips the MP POST
for `fb.`/missing ids — there is no real GA4 session to attribute to, so sending
would pollute GA4 with phantom events.

**Why `_ga` cookie parsing (not `window.ga`):** `window.ga` is Universal Analytics,
not GA4. GA4 uses `gtag` behind GTM. Reading the `_ga` cookie gets the client_id
without depending on GTM being loaded.

## Accuracy notes
- The fallback heuristic matches `language`+`country` within 30 min; false
  positives are possible when multiple same-country/language guests start a booking
  within the window — rare for a boutique lodge. Sessions older than 2 h are
  auto-deleted after each insert.
- The exact native path (real `_ga` id on the direct row) is precise and is the
  expected path for most conversions now.
