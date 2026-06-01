---
name: GA4 attribution architecture
description: How confirmed Beds24 bookings are attributed back to the original browser session via GA4 Measurement Protocol
---

# GA4 Measurement Protocol Attribution

## The problem
Beds24 booking happens inside a sandboxed iframe on `beds24.com`. Standard GA4 cross-domain linking and `postMessage` listeners don't survive the iframe boundary. Client-side tracking can record `reservation_initiated` but can never record `reservation_complete` with correct attribution.

## The solution
A three-layer server-side attribution chain:

1. **Frontend click** (`HeroSection.jsx`, `Header.jsx`): reads `_ga` cookie for client_id (`GA1.1.X.Y` → last two segments), POSTs `{cid, lang, currency}` to `/api/track-session` CF Pages Function (fire-and-forget, no UX impact).
2. **CF Pages Function** (`functions/api/track-session.js`): reads `cf-ipcountry` header for country, forwards to automailer Express endpoint with `ADMIN_API_KEY`.
3. **Automailer** (`server/services/ga4-attribution.ts`): when email-automation processes a confirmed Beds24 booking, calls `matchBookingSession(language, country)` — 30-minute window query — then fires GA4 Measurement Protocol `purchase` event with the matched `client_id`.

## Required env vars (must be set before automailer deploy)

**Render dashboard:**
- `GA4_MEASUREMENT_ID` — e.g. `G-XXXXXXXXXX`
- `GA4_API_SECRET` — from GA4 > Admin > Data Streams > Measurement Protocol API secrets

**Cloudflare Pages dashboard:**
- `AUTOMAILER_URL` — Render service URL, e.g. `https://devocean-automailer.onrender.com`
- `ADMIN_API_KEY` — same key already used by automailer's `requireAdminKey` middleware

## Required DB migration
Run `render-automailer/migrations/add_booking_sessions.sql` against Supabase before deploying the automailer update.

## Key files
- `render-automailer/shared/schema.ts` — `bookingSessions` table definition
- `render-automailer/server/services/database.ts` — `createBookingSession`, `matchBookingSession`, `cleanupOldSessions`
- `render-automailer/server/services/ga4-attribution.ts` — `fireGA4Conversion`
- `render-automailer/server/services/email-automation.ts` — attribution hook after `createBooking`
- `render-automailer/server.ts` — `/api/track-session` POST endpoint (uses `guestDb`, not `db`)
- `WebsiteProject/functions/api/track-session.js` — CF Pages Function
- `WebsiteProject/src/utils/analytics.js` — `getGA4ClientId`, `trackBookingSession`

## Attribution accuracy notes
- Match uses `language` + `country` + 30-minute time window. False positives possible when multiple guests from the same country/language click "Book Now" within 30 min — rare for a boutique lodge.
- Sessions older than 2 hours are auto-deleted after each insert (cleanup in `guestDb.cleanupOldSessions()`).

**Why:** `window.ga` (proposed) is the Universal Analytics API, not GA4. GA4 uses `gtag` behind GTM. Direct `_ga` cookie parsing is the correct approach for reading client_id without depending on GTM being loaded.

## Fallback client_id pattern (`fb.` prefix)

GTM is deferred until first interaction (keeps Lighthouse TBT clean). Clicking "Book Now" IS that first interaction — GA4 writes `_ga` ~300–800 ms later. `trackBookingSession` retries 3× at 500 ms. After all retries fail (consent blocked / strict privacy browser), it generates `fb.TIMESTAMP.RANDOM` from `sessionStorage` and POSTs that instead.

`fb.` IDs: automailer stores the session but `fireGA4Conversion()` skips the MP POST — no real GA4 session to attribute to, so sending would pollute GA4 with phantom events.

## CF Pages env var deployment rule

Dashboard UI is locked when `wrangler.toml` exists. Adding vars through the dashboard creates a `Binding name already in use` error on next deploy. Rule: `AUTOMAILER_URL` goes in `wrangler.toml [vars]`; `ADMIN_API_KEY` is uploaded via `wrangler pages secret put` inside `deploy.sh`. Always run `bash deploy.sh` from `WebsiteProject/` — never add these manually in the CF dashboard.

## Verified working (June 2026)
End-to-end test confirmed: real `purchase` event appeared in GA4 Realtime with correct `client_id` after a live Beds24 booking was processed.
