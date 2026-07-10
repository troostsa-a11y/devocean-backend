# DEVOCEAN Lodge - Email Automation, Website & Voice Receptionist Platform

## Overview

Three-part monorepo for DEVOCEAN Lodge, a hospitality property in Ponta do Ouro, Mozambique:

1. **Email Automation Service** (`render-automailer/`, deploys from GitHub main) — reads Beds24 booking notifications via IMAP, stores bookings in PostgreSQL, sends scheduled transactional emails (post-booking, pre-arrival, arrival welcome, post-departure, cancellation).
2. **Marketing Website** (`WebsiteProject/`, Cloudflare Pages, wrangler-managed, deploys via `bash deploy.sh`) — React + Vite + Tailwind, coastal/hospitality theme. Live at `https://devoceanlodge.com`.
3. **Marin Voice Receptionist** (`voice-reception/`, deploys as a separate Render `web` service from this repo) — pnpm workspace; Express 5 API server + React/Vite admin dashboard. Guests click a floating mic button on the website to talk to Marin, an AI receptionist powered by OpenAI real-time audio (`gpt-realtime-2`), with live Beds24 availability lookup and live FX conversion.

## User Preferences

Preferred communication style: Technical coding-agent register — direct, pair-programmer tone. Talk in code/implementation terms (files, functions, requests, data flow), not product/marketing framing. Skip the "here's what you'll see" hospitality phrasing; lead with what changed in the code and why.

Testing & deploying are done by the user, not the agent. The user prefers to run all testing (including end-to-end tests, test bookings, and test payments) and all deployments (`bash deploy.sh`) themselves — as a preventative measure against surprises (e.g. an unexpected real booking landing in the live Beds24 calendar), and because testing is one of the few things the user is better at than the agent. The agent should propose exact steps and let the user execute them; do not run tests or deploy without an explicit request to do so.

## Deployment

- **Website**: `bash deploy.sh` from `WebsiteProject/` — builds, uploads the `ADMIN_API_KEY` Cloudflare secret, and deploys in one step. CF vars are wrangler-managed (`wrangler.toml`); do NOT set them via the Cloudflare dashboard (UI is locked for vars).
- **Automailer**: deploys from GitHub `main` (Render). Render service name: **"Automailer"** (type: `web`). Build: `npm install && npm run build` (tsc must run to produce `dist/server.js`). Start: `npm start`. Env vars set in the Render dashboard.
- **Marin Voice Receptionist**: deploys from GitHub `main` as a separate Render `web` service. Render service name: **"Receptionist"** (type: `web`). Root dir: `voice-reception`. Build: `npm config set prefix /tmp/npm-global && npm install -g pnpm@10 && export PATH=/tmp/npm-global/bin:$PATH && pnpm install --frozen-lockfile && pnpm run typecheck && pnpm run build`. Start: `node --enable-source-maps ./artifacts/api-server/dist/index.mjs`. Live at `https://mia-voice-receptionist.onrender.com`. Admin dashboard at `https://mia-voice-receptionist.onrender.com/` (password-protected). See `render.yaml` for full env var list.

> **Render Blueprint gotcha**: `render.yaml` service `name` AND `type` must match the existing Render service exactly. A mismatch on either field causes Render to create a duplicate service rather than updating the existing one. Current correct entries: `name: Automailer, type: web` and `name: Receptionist, type: web`.

## System Architecture

### Backend (render-automailer)
- Node.js + TypeScript, Express HTTP server (type: `web` — serves HTTP endpoints including `/api/booking/webhook`, `/api/track-session`, admin routes).
- Email: IMAP (imap-simple) reads Beds24 emails; Nodemailer sends.
- Scheduling: node-cron. Timezone: Luxon, all scheduling in CAT (UTC+2).

### Voice Receptionist (voice-reception/)
- **Stack**: pnpm workspace, Node 24 / TypeScript 5.9, Express 5 API server (`artifacts/api-server/`), React 19 + Vite admin dashboard (`artifacts/receptionist/`), shared libs in `lib/`.
- **Runtime**: Express serves the API at `/api/*` and also serves the receptionist's compiled Vite build as static files (so `/embed`, `/widget-loader.js`, and the admin SPA all come from the same Render URL). SPA fallback in `app.ts` catches unmatched routes.
- **AI model**: `gpt-realtime-2` via WebSocket relay in `artifacts/api-server/src/routes/openaiRealtimeRelay.ts`. Env: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL` (`https://api.openai.com/v1`), `OPENAI_REALTIME_MODEL` (`gpt-realtime-2`), `OPENAI_TEXT_MODEL` (`gpt-4o`). Voice: `marin` (OpenAI voice name). Do NOT use the bare `gpt-4o-audio-preview` alias — it is retired and returns 404; always use a dated alias or `gpt-realtime-2`.
- **Receptionist name**: **Marin** (not Mia). All UI strings (`VoiceWidget.tsx`, `ConversationDetail.tsx`) and the system prompt use "Marin". The widget embed URL placeholder in `WebsiteProject/index.html` still uses `%%MIA_URL%%` — this is a build-time token, not a user-visible string.
- **System prompt** (`artifacts/api-server/src/routes/openai.ts`):
  - `buildSystemPrompt(lang)` injects current CAT time (UTC+2) so Marin uses correct time-of-day greetings.
  - Pronunciation guide: DEVOCEAN spoken as **DEE-VO-SHUN** (three distinct syllables, stress first); written always as "DEVOCEAN".
  - "Give me a moment" filler spoken **only** before `check_availability` and `get_weather` (these hit live external APIs and take seconds). NOT before `convert_currency` or `save_booking_enquiry` (near-instant).
- **VAD (Voice Activity Detection)**: server-side VAD configured in `openaiRealtimeRelay.ts` with `threshold: 0.65` (default 0.5), `silence_duration_ms: 600`. VAD is **disabled for the entire duration of any Marin response** (`response.created` → mute, `response.done` → unmute via `session.update`). This prevents Marin's speaker output from being falsely detected as user speech and cutting her off mid-sentence. VAD is re-enabled after `response.done` so the user can speak freely between turns.
- **Session loop guard**: `sessionGreetingSent` flag in the relay ensures `response.create` (opening greeting) is sent only on the **first** `session.updated` event. Subsequent `session.updated` events — triggered by VAD mute/unmute `session.update` calls — are silently dropped. Without this guard, each VAD update creates an infinite `session.updated → response.create → response.created → session.update → session.updated` loop.
- **Booking enquiry notifications**: `save_booking_enquiry` tool (`artifacts/api-server/src/beds24/tool.ts`) fires a fire-and-forget SMTP email when Marin captures an enquiry. Env vars (set on the Render "Receptionist" service, values copied from the Automailer service):
  - `NOTIFY_SMTP_HOST` = automailer `MAIL_HOST`
  - `NOTIFY_SMTP_PORT` = automailer `MAIL_PORT` (default 465, SSL/TLS)
  - `NOTIFY_SMTP_USER` = automailer `IMAP_USER`
  - `NOTIFY_SMTP_PASS` = automailer `IMAP_PASSWORD`
  - `NOTIFY_EMAIL_FROM` — sender address shown in the alert
  - `NOTIFY_EMAIL_TO` — recipient (lodge owner personal email)
  - Dates in the email body are formatted as "11 July 2026" (not YYYY-MM-DD).
- **Beds24**: read-only availability + pricing tool in `artifacts/api-server/src/beds24/`. Env: `BEDS24_TOKEN` (or `BEDS24_INVITE_CODE`), `BEDS24_PROPERTY_ID` (default `297012`).
- **DB**: dedicated Reception Supabase project (`DATABASE_URL`) — separate from the Lodge/automailer DB. Session pooler: `aws-0-eu-west-3.pooler.supabase.com`. Drizzle ORM schema in `lib/db/`; tables: `conversations`, `messages`, `bookings`, `integration_tokens`.
- **Widget embed**: `widget-loader.js` (in `artifacts/receptionist/public/`) creates a floating mic button that opens an iframe pointing to `/embed` on the same origin. In `WebsiteProject/index.html`, the script src uses `%%MIA_URL%%` — replaced at Vite build time by the `MIA_URL` constant in `vite.config.js`.
- **Browser mic**: acquired with `echoCancellation: true, noiseSuppression: true, channelCount: 1` in `useRealtimeSession.ts`. Audio piped via `ScriptProcessorNode` → PCM16 → base64 → WebSocket to relay.
- **Dev**: `pnpm --filter @workspace/api-server run dev` from `voice-reception/` (runs esbuild + starts Express; needs `PORT` and `DATABASE_URL` set).

### Frontend
- React 18 + TypeScript, Vite, Wouter routing, TanStack Query, shadcn/ui (New York), Tailwind CSS variables.

### Data Layer
- Drizzle ORM (PostgreSQL). Schema in `shared/schema.ts`: bookings, scheduledEmails, emailLogs, emailCheckLogs, pendingCancellations.
- Storage abstraction in `server/storage.ts` (in-memory interface, swappable for DB).

### Email Templates & Languages
- Base HTML in `email_templates/base/`; per-language JSON in `email_templates/translations/`.
- **Languages (20 base / 22 locale variants)**: EN (en-GB, en-US), PT (pt-PT, pt-BR), DE, FR, ES, IT, NL, SV, PL, RO, SR (Latin), HR (ijekavian), CS, TR, JA, ZH, RU, AF, ZU, SW. New website langs are added by mirroring the SR pipeline (`langs/<code>.js`, content blocks, accommodation-translations.json, seoMeta, experiencePageTranslations, useLocale, Header, critical, localize).
- Template renderer applies translations + data substitution.

### Design System
- Palette: Ocean Blue, Warm Sand, Deep Teal (see `design_guidelines.md`). Typography: Inter/DM Sans. Full shadcn/ui + Radix.

## External Dependencies

- **Database**: PostgreSQL via Supabase. `DATABASE_URL` (Render). Driver: `drizzle-orm/postgres-js` (direct connection — never goes through Supabase's PostgREST/anon or authenticated keys). Row Level Security is enabled on all 9 production tables (`bookings`, `scheduled_emails`, `email_logs`, `email_check_logs`, `pending_cancellations`, `guests`, `booking_sessions`, `direct_bookings`, `coupon_codes`) as defense-in-depth; it doesn't affect the app itself since the direct connection bypasses RLS, but it blocks anon/authenticated access if the Supabase key were ever leaked.
- **Email**: IMAP needs `MAIL_HOST`, `MAIL_PORT`, `IMAP_USER`, `IMAP_PASSWORD`; SMTP reuses the host. Optional taxi notify: `TAXI_EMAIL`, `TAXI_WHATSAPP`, `TAXI_NAME`.
- **Beds24**: PMS — booking notifications parsed from email (and REST API, see Native Direct Booking).
- **Cloudflare**: CORS for CF Functions.
- **Booking platforms**: QR codes for Booking.com, Google Reviews, TripAdvisor.
- **Dev tools**: Replit plugins (runtime-error-modal, cartographer, dev-banner — dev only); TS strict; drizzle-kit migrations.

## Performance Notes (WebsiteProject)

### Lazy Loading
- **Eager (must NOT lazy-load)**: `Header`, `HeroSection`, `AccommodationsSection`, `ExperiencesSection`, `TodoSection` — they render immediately on the homepage; lazy-loading them regresses CLS/TBT.
- **Lazy**: `GallerySection`, `LocationSection`, `ContactSection`, `Footer`, all route pages.
- **ExcelJS**: dynamically imported in `AdminPage.jsx` only on export — keeps the 920 KB chunk off the critical path.

### Hero Image Mobile Focal Points
- On mobile, hero photos are cropped (portrait viewport, landscape photo). `mobileObjectClass` in `HERO_IMAGES` (`src/data/content.js`) sets CSS `object-position`. Desktop (`sm:`+) reverts to `object-center`.
- Current (Jun 2026): hero01 65/50 (lodge), hero02 75/30 (divers), hero03 45/50 (dolphins), hero04 70/50 (game), hero05 87/50 (hike). Adjust `mobileObjectClass` then redeploy.

### Hero Overlay + LCP
Full reasoning in `.agents/memory/hero-overlay-lcp.md` + `hero-cls-fix.md`. Key rules:
- **LCP = `#hero-title` text, not the hero image** — full-viewport `<img>` is excluded by Chrome's "full-viewport = background" heuristic. No image change can fix hero LCP.
- **Do NOT re-enable CookieYes IAB TCF v2.3** — fetches 118 KB IAB vendor list, wins LCP at ~10 s on Slow 4G. Disabled Jun 2026; standard GDPR banner only.
- **`HeroSection` uses `items-start`, NOT `items-center`** — centering shifts text when translations load.
- **Do NOT hide `#root`** during overlay (`html.hero-active #root { opacity: 0 }` delays LCP).
- **Placeholder + React padding must stay in lockstep**: React uses `--header-h`; placeholder uses `--stack-h`. Do NOT give `HeroSection` `--stack-h` padding — double-counts the topbar → CLS jump.
- **CLS sync values** (small phones `<640px`): React content padding `pt-[calc(var(--header-h)_-_1rem)]`; placeholder mirrors `calc(var(--stack-h) - 1rem)`. Use `639.98px` not `639px` to exactly complement Tailwind `sm:`.
- **Mobile (`<640px`) hides `#hero-title`** (display:none, stays in DOM for SEO/i18n); LCP falls to `#hero-subtitle`. React subtitle: `mt-14 sm:mt-4 text-xl` at all widths.
- **Script at bottom**: React entry `<script type="module">` is re-appended to `<body>` end by `moveScriptToBody` plugin in `vite.config.js`. Do NOT set `build.modulePreload: false` — removes parallel chunk hints → sequential waterfall.
- **Homepage guard**: placeholder bails on non-`/` paths and on `/#hash` deep links to avoid 5 s flash.

### Consent & Analytics
- **CookieYes**: loaded immediately (GDPR); `<link rel="preconnect" href="https://cdn-cookieyes.com">` in `<head>`.
- **GTM + Engagement Tracker**: deferred until first interaction (click/keydown/touchstart), 15 s fallback — keeps GTM out of Lighthouse TBT.

### GA4 Attribution Pipeline
- "Book Now" clicks fire `trackBookingSession()` → CF Function `functions/api/track-session.js` → automailer `/api/track-session` → `booking_sessions` (Supabase). When a Beds24 confirmation email arrives, `matchBookingSession()` joins by language + country within a 30-min window, then `fireGA4Conversion()` sends a `purchase` event via GA4 Measurement Protocol with the original browser `client_id`.
- **Render env**: `GA4_MEASUREMENT_ID`, `GA4_API_SECRET`. **CF env**: `AUTOMAILER_URL` (in `wrangler.toml`); `ADMIN_API_KEY` (CF secret, uploaded by `deploy.sh`).

### Native Direct Booking (Beds24 REST API + Stripe deposit)
- Native flow at `/book-direct` (confirmation `/booking-confirmed`). Guest picks dates/room, pays a deposit via Stripe Checkout, balance on arrival.
- **Payment is the source of truth**: Beds24 booking created only from a signature-verified Stripe `checkout.session.completed` webhook. Server recomputes price + deposit from a fresh Beds24 quote at checkout and again at webhook — client amounts never trusted.
- **Double-booking guard**: room re-checked at webhook time; if sold out, deposit auto-refunded and booking marked `sold_out_refunded`.
- **Emails + GA4 fire from the webhook, not IMAP**: Beds24 sends no notification email for REST-API bookings. Stripe webhook calls `emailService.createManualBooking(...)` which schedules guest emails and is the GA4 fire point. Attribution via `EmailAutomationService.attributeBooking()` (shared by native + IMAP paths); `ga4_conversion_fired_at` enforces single-fire.
- **Data**: `direct_bookings` table (deposit/balance/Stripe refs/Beds24 id/status); SQL in `render-automailer/migrations/add_direct_bookings.sql`.
- **Backend**: `server/services/beds24.ts`, `stripe-booking.ts`, `server/config/booking-config.ts`. Routes in `server/routes/booking.ts`.
- **Frontend proxy**: CF Functions in `functions/api/booking/*` inject `x-admin-key` + `cf-ipcountry`; browser never sees the admin key.
- **Render env**: `BEDS24_REFRESH_TOKEN`, `BEDS24_PROP_ID`, `BEDS24_API_BASE`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`; optional `DEPOSIT_PERCENT` (50), `CANCELLATION_POLICY_DAYS` (30), `BOOKING_CURRENCY` (USD), `PUBLIC_SITE_URL`.
- **Stripe webhook**: `https://devocean-automailer.onrender.com/api/booking/webhook` for `checkout.session.completed`.

### Discount Codes (book-direct discounts)
- **Naming**: UI labels say "Discount Code" throughout. The underlying DB table and column are still `coupon_codes` / `coupon_code` — do NOT rename the DB objects. `BOOKING_STRINGS` key is `discountCodeApplied`; admin API endpoint is `/api/admin/discount-codes`.
- Reusable phrase codes only (e.g. `DEVOCEANVIP` 10% percent-off, `TRTS0807` $32 fixed-off) — Beds24's One-Time-Use Voucher box is out of scope.
- **Admin-managed, no redeploy needed**: created/edited/deactivated from the existing `/admin` page's "Discount Codes" tab, backed by the `coupon_codes` table (`code`, `type` percent|fixed, `value`, `active`). Admin routes live in `render-automailer/server.ts`.
- **Discount math**: applied to the quoted total before the deposit split, except last-minute offers — those keep the existing 100% deposit rule regardless of discount. Normal stays still split 50/50 on the *discounted* total.
- **NR (non-refundable) rate plans ARE shown to guests**: displayed as the cheaper option in the rate picker. Deposit for NR is always 100% upfront (same as LM last-minute) — handled in `getDepositPercentForOffer`. Under the NR option the UI shows "Non-refundable · Full payment now · Rate conditions" where "Rate conditions" links to `https://devoceanlodge.com/legal/terms#cancel`. Cart summary appends `(Full payment now)` via `withRateNote()`. NR is sorted first (cheapest) by `priceOffers()` since offers are sorted ascending by price.
- **Beds24 record**: the discount is written into the Beds24 booking (not just Stripe/DB-side) so the PMS reflects the real charged amount.
- **Data**: `coupon_code` and `discount_amount` columns on `direct_bookings`; migration in `render-automailer/migrations/add_coupon_codes.sql`. Applied directly via the Supabase SQL editor (this DB isn't Replit-managed, so there's no Publish-time schema diff step — migrations here are run by hand against production).
- **Frontend**: discount code input + discount line in `BookDirectPage.jsx` and `BookingConfirmedPage.jsx`; i18n keys in `bookingStrings.js` across all 20 base langs for both `BOOKING_STRINGS` and `CONFIRM_STRINGS`.

### Gift Vouchers
- **Flow**: purchaser visits `/gift-vouchers` (`GiftVouchersPage.jsx`), picks a denomination ($20/$50/$100/$200/$500), enters their name + email (+ optional recipient name + personal message), pays via Stripe Checkout. On `checkout.session.completed` webhook the server generates a one-time-use code (`GV-XXXX-XXXX-XXXX`), stores it in the `gift_vouchers` table, and emails the code to the purchaser. Confirmation page at `/gift-confirmed` (`GiftConfirmedPage.jsx`).
- **Redemption**: `/book-direct` search form has a "Gift Voucher Code" input alongside the discount code field. The quote endpoint (`/api/booking/quote`) validates the code, deducts the voucher amount from the total, and returns `voucherApplied`, `voucherAmountApplied`, `voucherError`. The voucher code and discount amount are written to `direct_bookings` (`voucher_code`, `voucher_discount`) at checkout; the voucher row is marked `redeemed` at Stripe webhook time.
- **DB table** (`gift_vouchers`): `id`, `code` (unique, `GV-XXXX-XXXX-XXXX`), `amount_usd`, `purchaser_email`, `purchaser_name`, `recipient_name`, `message`, `stripe_session_id`, `status` (active/redeemed/expired/cancelled), `redeemed_at`, `redeemed_by_booking_id`, `created_at`.
- **DB migration** (run manually in Supabase SQL editor, Automailer project):
  ```sql
  -- gift_vouchers table (see render-automailer/migrations/add_gift_vouchers.sql)
  -- Plus columns on direct_bookings:
  ALTER TABLE direct_bookings
    ADD COLUMN IF NOT EXISTS voucher_code     text,
    ADD COLUMN IF NOT EXISTS voucher_discount numeric(10,2);
  ```
- **Backend routes** (all in `render-automailer/server.ts` + `server/routes/booking.ts`): `POST /api/gift-voucher/checkout` (creates Stripe session), `GET /api/gift-voucher/confirm/:sessionId` (polls status after redirect), `GET /api/gift-voucher/validate?code=` (used by quote endpoint).
- **Stripe webhook**: same `checkout.session.completed` handler as direct bookings; gift-voucher sessions are distinguished by `metadata.type === 'gift_voucher'`.
- **CF Functions**: `functions/api/gift-voucher/checkout.js` and `confirm.js` — proxy to automailer, inject `x-admin-key`.
- **Drizzle schema**: `giftVouchers` table in `render-automailer/shared/schema.ts`; `voucherCode` + `voucherDiscount` columns on `directBookings`.
- **Email**: sent via automailer's existing SMTP credentials (`MAIL_HOST` / `MAIL_PORT` / `IMAP_USER` / `IMAP_PASSWORD`). No new env vars required.
- **Promo banner**: amber gift-icon banner at the bottom of the `/book-direct` search card links to `/gift-vouchers`.
- **Page layout**: `GiftVouchersPage` and `GiftConfirmedPage` use `pt-[var(--stack-h)]` to clear the fixed site Header; no secondary header bar — a simple inline "← Back to booking" link sits at the top of the content area.

### Date Range Picker (book-direct search)
- `DateRangePicker.jsx`: dual-month range calendar built on **luxon** (not react-day-picker). Monday-first, names via `DateTime.setLocale(lang)` / `Info.weekdays`. Dates stay `YYYY-MM-DD` strings throughout.
- First click sets check-in + default 1-night checkout; second click sets checkout and closes. Checkout always strictly after check-in.
- **Rate-tier coloring**: cells tinted Blue→Red by relative Beds24 per-date rates (display-only). Backend: `getPriceCalendar` → `GET /api/booking/calendar`. Bucketing: ≤5 distinct prices = exact map; else p5/p95-trimmed equal-width bands.
- **i18n**: booking copy in all 20 base langs (`bookingStrings.js`). Each lang object must carry every key — partial objects render `undefined`, not EN fallback.

### Mobile Menu Accessibility
- `#mnav` drawer is always in the DOM (CSS transform/opacity). When closed: `inert=""` + `visibility: hidden`. Do NOT reintroduce `aria-hidden` — triggers Chrome WAI-ARIA warning when a focused descendant is hidden.

## Maintenance Guidelines

- **Keep the hero asset lightweight**: any image replacing `hero01-mobile.webp` must stay under 15 KB compressed. The 5 s overlay delay is tuned to a ~1.5 s load on Slow 4G.
- **Monitor attribution match rate**: check Render logs for `matchBookingSession`. The 30-min language + country window should bind most confirmed bookings to a `client_id`. A low rate signals clock drift, missing `cf-ipcountry`, or sessions expiring before the booking email arrives.
- **Defer new third-party scripts**: load any future tracking/widgets with the `requestIdleCallback` + first-interaction pattern used for GTM.
- **Render Blueprint sync**: when adding new env vars to `render.yaml`, verify the service `name` and `type` match the live Render service exactly before pushing — a mismatch silently creates a duplicate service rather than erroring.
- **Marin VAD tuning**: VAD threshold and silence window live in `SERVER_VAD` const at the top of `openaiRealtimeRelay.ts` (currently `threshold: 0.65`, `silence_duration_ms: 600`). The response-level mute means these only affect user-turn detection between Marin's responses, not during them.
