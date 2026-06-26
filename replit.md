# DEVOCEAN Lodge - Email Automation & Website Platform

## Overview

Dual-purpose project for DEVOCEAN Lodge, a hospitality property in Ponta do Ouro, Mozambique:

1. **Email Automation Service** (`render-automailer/`, deploys from GitHub main) — reads Beds24 booking notifications via IMAP, stores bookings in PostgreSQL, sends scheduled transactional emails (post-booking, pre-arrival, arrival welcome, post-departure, cancellation).
2. **Marketing Website** (`WebsiteProject/`, Cloudflare Pages, wrangler-managed, deploys via `bash deploy.sh`) — React + Vite + Tailwind, coastal/hospitality theme.

Monorepo: shared schema, Node/Express backend, Vite React frontend.

## User Preferences

Preferred communication style: Technical coding-agent register — direct, pair-programmer tone. Talk in code/implementation terms (files, functions, requests, data flow), not product/marketing framing. Skip the "here's what you'll see" hospitality phrasing; lead with what changed in the code and why.

Testing & deploying are done by the user, not the agent. The user prefers to run all testing (including end-to-end tests, test bookings, and test payments) and all deployments (`bash deploy.sh`) themselves — as a preventative measure against surprises (e.g. an unexpected real booking landing in the live Beds24 calendar), and because testing is one of the few things the user is better at than the agent. The agent should propose exact steps and let the user execute them; do not run tests or deploy without an explicit request to do so.

## Deployment

- **Website**: `bash deploy.sh` from `WebsiteProject/` — builds, uploads the `ADMIN_API_KEY` Cloudflare secret, and deploys in one step. CF vars are wrangler-managed (`wrangler.toml`); do NOT set them via the Cloudflare dashboard (UI is locked for vars).
- **Automailer**: deploys from GitHub `main` (Render). Env vars set in the Render dashboard.

## System Architecture

### Backend (render-automailer)
- Node.js + TypeScript, Express HTTP server.
- Email: IMAP (imap-simple) reads Beds24 emails; Nodemailer sends.
- Scheduling: node-cron. Timezone: Luxon, all scheduling in CAT (UTC+2).

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

- **Database**: PostgreSQL via Supabase. `DATABASE_URL` (Render). Driver: `drizzle-orm/postgres-js`.
- **Email**: IMAP needs `MAIL_HOST`, `MAIL_PORT`, `IMAP_USER`, `IMAP_PASSWORD`; SMTP reuses the host. Optional taxi notify: `TAXI_EMAIL`, `TAXI_WHATSAPP`, `TAXI_NAME`.
- **Beds24**: PMS — booking notifications parsed from email (and REST API, see Native Direct Booking).
- **Cloudflare**: CORS for CF Functions.
- **Booking platforms**: QR codes for Booking.com, Google Reviews, TripAdvisor.
- **Dev tools**: Replit plugins (runtime-error-modal, cartographer, dev-banner — dev only); TS strict; drizzle-kit migrations.

## Performance Notes (WebsiteProject)

### Lazy Loading
- **Eager (must NOT lazy-load)**: `Header`, `HeroSection`, `AccommodationsSection`, `ExperiencesSection`, `TodoSection` — they render immediately on the homepage; lazy-loading them regresses CLS/TBT (Suspense fallback heights mismatch; parallel chunk fetches add blocking time).
- **Lazy**: `GallerySection`, `LocationSection`, `ContactSection`, `Footer`, all route pages.
- **ExcelJS**: dynamically imported in `AdminPage.jsx` only on export — keeps the 920 KB chunk off the critical path.

### Hero Image Mobile Focal Points
- On mobile, hero photos are cropped (portrait viewport, landscape photo). `mobileObjectClass` in `HERO_IMAGES` (`src/data/content.js`) sets CSS `object-position`. Desktop (`sm:`+) reverts to `object-center`.
- Percentage: `50%` = centre; `>50%` shifts the visible window right; `<50%` shifts left.
- Current (Jun 2026): hero01 65/50 (lodge), hero02 75/30 (divers), hero03 45/50 (dolphins), hero04 70/50 (game), hero05 87/50 (hike). Adjust `mobileObjectClass` then redeploy.

### Hero Overlay + LCP (homepage only)
- `#hero-placeholder` is a static HTML div (not React) showing a preloaded hero image, dismissed by a CSS animation on the compositor thread. It contains a real `<h1 id="hero-title">` and `<p id="hero-subtitle">` only — the intro deliberately shows just the lodge name + tagline (the placeholder previously mirrored the React hero's CTA buttons, but those non-interactive button-shaped `<div>`s were removed as confusing during startup). Removing them does not affect CLS/LCP: the placeholder is `position: fixed` (out of layout flow) and the buttons sat *below* the title/subtitle, so the `<h1>`/`<p>` y-positions and the hero-image LCP candidate are unchanged. Keep the `#hero-title`/`#hero-subtitle` IDs — the localization inline script updates them to the visitor's language.
- **5 s delay is intentional**: `hero01-mobile.webp` takes ~1.5 s on Slow 4G. The overlay must still be `opacity: 1` when the image paints so Chrome registers it as the LCP candidate. A shorter delay fades the overlay before the image arrives → Chrome skips it and waits for the React hero (~8 s on 4× CPU). Animation: `heroDismiss 0.4s cubic-bezier(0.25,1,0.5,1) 5s forwards` (`will-change: opacity` → own GPU layer). JS `setTimeout` is cleanup-only at 5500 ms (5000 + 400 fade + 100). Returning visitors: `animation = 'none'` before `display:none` — they never see it.
- **Padding must match (CLS)**: placeholder uses `calc(var(--stack-h) + 4rem)` (fixed → measured from viewport top, content at y:168 desktop / y:160 mobile). React `HeroSection` uses `paddingTop: calc(var(--header-h) + 4rem)` — the in-flow 40px topbar already offsets the section, so only `--header-h` is added, yielding the same y. **Do NOT change `HeroSection` back to `calc(var(--stack-h) + 4rem)`** (placed content 40px / desktop 253px lower → major CLS jump on fade).
- **`HeroSection` uses `items-start`, NOT `items-center`** — flex centering shifts all hero text when content height changes (translations loading, `criticalUI → full ui`). Do NOT revert to `flex items-center`.
- **`#root` is NOT hidden** during the overlay (placeholder is `position: fixed; z-index: 9999`). Do NOT reintroduce `html.hero-active #root { opacity: 0 }` — it delays LCP by hiding paint candidates. `hero-active` (keeps background dark) is removed by `App.jsx`'s `useEffect` after first mount.
- **Homepage guard**: the inline script bails before first paint on any path other than `/` **and** on a homepage load that carries a section hash (`window.location.hash.length > 1`, e.g. `/#experiences` from a "Back to Experiences" link) — in both cases it injects `#hero-placeholder{display:none!important}` and returns. "Rates & Availability" / Book Now buttons are plain `<a href="/book-direct">` full-page navigations; without this guard a fresh load of any deep link would flash the homepage hero for 5 s. The hash bail is what stops the overlay from covering a deep-linked section; a plain `/` (no hash) still shows the LCP overlay normally.

### Script-at-bottom + modulePreload
- The React entry `<script type="module">` lives at the **very bottom of `<body>`** in `index.html` (after the placeholder + inline scripts); a custom `moveScriptToBody` plugin in `vite.config.js` re-appends the built entry there.
- `build.modulePreload: { polyfill: false }` keeps Vite's `<link rel="modulepreload">` hints for vendor chunks (react-vendor, icons, framer) so they download in parallel with the entry. **Do NOT set `modulePreload: false`** — that removes the hints and creates a sequential waterfall (React render ~3s → ~6–7s).
- Net effect: the preloaded WebP paints as an LCP candidate at ~1.5 s before JS runs.

### Booking Iframe (book/*.html)
- `#beds24frame` has **NO `sandbox` attribute** — it loads `beds24.com/booking2.php` with full iframe permissions.
- **Why**: bookings take a 50% Stripe deposit *inside* the Beds24 iframe; Stripe's payment/3-D-Secure step needs storage-access, popups, and redirect freedoms. A `sandbox` (even with `allow-top-navigation`) blocked the post-payment return → blank/error instead of `/thankyou`. **Do NOT reintroduce a `sandbox`** on `#beds24frame`.
- Confirmation: Beds24 redirects to `/thankyou.html?bookid=...`; Cloudflare Pages 308-redirects `.html` → clean URL; `thankyou.html`'s frame-buster (`window.top.location.replace`) takes the top window if loaded in-frame.

### Consent & Analytics
- **CookieYes**: loaded immediately (GDPR); `<link rel="preconnect" href="https://cdn-cookieyes.com">` in `<head>`.
- **GTM + Engagement Tracker**: deferred until first interaction (click/keydown/touchstart), with a 15 s fallback — set to 15 s so Lighthouse audits (which never interact) don't count GTM in TBT.

### GA4 Attribution Pipeline
- "Book Now" clicks fire `trackBookingSession()` → CF Function `functions/api/track-session.js` → automailer `/api/track-session` → `booking_sessions` (Supabase). When a Beds24 confirmation email arrives, `matchBookingSession()` joins by language + country within a 30-min window, then `fireGA4Conversion()` sends a `purchase` event via GA4 Measurement Protocol with the original browser `client_id`.
- **Render env**: `GA4_MEASUREMENT_ID`, `GA4_API_SECRET` (without these, matching still runs but the MP POST is skipped). **CF env**: `AUTOMAILER_URL` (in `wrangler.toml` `[vars]`); `ADMIN_API_KEY` (uploaded as a CF secret by `deploy.sh`).

### Native Direct Booking (Beds24 REST API + Stripe deposit)
- Native flow at `/book-direct` (confirmation `/booking-confirmed`) running *alongside* the iframe. Guest picks dates/room, pays a deposit via Stripe Checkout, balance on arrival.
- **Payment is the source of truth**: the Beds24 booking is created **only** from a signature-verified Stripe `checkout.session.completed` webhook. The server recomputes price + deposit from a fresh Beds24 quote at checkout and again at webhook time — client amounts are never trusted.
- **Double-booking guard**: at webhook time the room is re-checked; if sold out during the payment window the deposit is auto-refunded and the booking marked `sold_out_refunded`.
- **Emails + GA4 fire from the webhook, not IMAP**: Beds24 sends NO notification email for REST-API-created bookings, so the IMAP-ingest path never sees a direct booking. The Stripe webhook therefore calls `emailService.createManualBooking(...)` itself (after marking the row `confirmed`), which schedules the guest emails AND is the single GA4 fire point for the native flow. GA4 attribution lives in the shared `EmailAutomationService.attributeBooking()` helper, called from both `createManualBooking()` (native) and the IMAP loop (legacy/OTA). Native bookings carry the exact GA4 `client_id` captured at checkout (`direct_bookings.ga_client_id`) and fire one `purchase` with real revenue + currency; `ga4_conversion_fired_at` enforces single-fire. The lang+country session heuristic remains a fallback. Never fire from the webhook's Stripe-confirmation step directly — attribution is centralized in `attributeBooking()`.
- **Data**: separate `direct_bookings` table (deposit/balance/Stripe refs/Beds24 id/status); the `bookings` table + email flow are untouched. Idempotent init; SQL in `render-automailer/migrations/add_direct_bookings.sql`.
- **Backend**: `server/services/beds24.ts` (auth/refresh, availability quote, create, recheck), `stripe-booking.ts` (checkout, webhook verify, refund), `server/config/booking-config.ts`. Routes in `server/routes/booking.ts`: `/api/booking/{config,availability,checkout,result/:ref}` require `x-admin-key`; `/api/booking/webhook` is public but Stripe-signature-secured (raw body captured via an `express.json` `verify` callback in `server.ts`).
- **Frontend proxy**: CF Functions in `functions/api/booking/*` (+ dev routes in `server.js`) inject `x-admin-key` + `cf-ipcountry` and forward; the browser never sees the admin key. SPA routes resolve via the root `_middleware.js` 404→index.html fallback.
- **Render env**: `BEDS24_REFRESH_TOKEN`, `BEDS24_PROP_ID` (297012), `BEDS24_API_BASE` (`https://beds24.com/api/v2`), `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`; optional `DEPOSIT_PERCENT` (50 for DEVOCEAN; code default 30), `CANCELLATION_POLICY_DAYS` (default 30), `BOOKING_CURRENCY` (default USD), `PUBLIC_SITE_URL`. `ADMIN_API_KEY` is reused from track-session.
- **Stripe setup**: point a webhook at `https://devocean-automailer.onrender.com/api/booking/webhook` for `checkout.session.completed`; signing secret → `STRIPE_WEBHOOK_SECRET`.
- **Guest currency override (display only)**: top-bar `CurrencyPicker.jsx` country picker forces a country's national currency (`CC_TO_CURRENCY`) as the *display* currency only — offers still render in `room.currency` (Beds24 base) and Stripe always charges base; it only retargets the approximate FX line + label. Persisted via `setCurrency()` in `useLocale.js` with `site.currency.source="user"` so the IP initializer never clobbers it (mirrors `site.lang_source`). Shown on all viewports; brand text truncates (`min-w-0`/`truncate`), picker group is `shrink-0`, dropdown is `w-[calc(100vw-2rem)] max-w-[18rem]` right-anchored (fits sub-320px). Strings `currencyLabel`/`currencySearch`/`currencyNoMatches` in the 7 booking base langs (EN fallback); country names via `Intl.DisplayNames`.

### Date Range Picker (book-direct search)
- `DateRangePicker.jsx` is a single dual-month range calendar (1 month mobile, 2 at `lg:`+) replacing native date inputs. Built on **luxon** (no react-day-picker available); Monday-first weeks, names localized via `DateTime.setLocale(lang)` / `Info.weekdays`.
- Dates stay `YYYY-MM-DD` strings — picker is UX-only, so `/api/booking/{availability,checkout}` payloads and `{checkIn} → {checkOut}` displays are untouched.
- First day click commits check-in with a default 1-night checkout (so an incomplete selection still submits a valid ≥1-night range); the second click sets checkout and closes; clicking a date `<= pendIn` restarts. Checkout is always strictly after check-in.
- Popover mirrors `CurrencyPicker` (opacity/visibility/pointerEvents/transform for INP; mousedown + Escape close; accent `#9e4b13`). Panel `w-[calc(100vw-3rem)] max-w-[20rem] lg:w-auto`, left-anchored, fits ~320px.
- **Rate-tier coloring**: day cells are tinted by relative rate tier (Blue=lowest … Red=peak), derived LIVE from Beds24 per-date rates — display-only, never affects checkout/Stripe amounts. Backend `getPriceCalendar` (`beds24.ts`) → `GET /api/booking/calendar` (admin-keyed, rate-limited); `BookDirectPage.jsx` fetches once on mount (fail-soft) and passes `priceByDate` to the picker. Bucketing: distinct-value map if ≤5 unique prices, else p5/p95-trimmed equal-width bands (<2 unique → no color). Cell precedence: disabled > endpoint > inRange > today+tint > tint > default.
- **i18n**: `night` + `selectDates` exist only in the 7 base booking langs (EN whole-object fallback via `getBookingStrings`). The rate-tier labels (`rateLegendTitle` + `rateTiers`) are localized for **all 20 base langs** via a separate `RATE_TIER_STRINGS` overlay in `bookingStrings.js` (overlaid onto the base object so they resolve even for the 13 langs whose booking page otherwise falls back to English).

### Mobile Menu Accessibility
- `#mnav` drawer is always in the DOM (CSS transform/opacity) to avoid hydration lag / INP regressions. When closed: `inert=""` removes children from the tab ring + a11y tree and `visibility: hidden` releases retained focus. Do NOT reintroduce `aria-hidden` — it triggered a Chrome WAI-ARIA warning when a focused descendant was hidden.

## Maintenance Guidelines

- **Keep the hero asset lightweight**: any image replacing `hero01-mobile.webp` must stay under 15 KB compressed. The 5 s overlay delay is tuned to a ~1.5 s load on Slow 4G; a heavier image needs a longer delay (hurts perceived performance).
- **Monitor attribution match rate**: check Render logs for `matchBookingSession`. The 30-min language + country window should bind most confirmed bookings to a `client_id`. A low rate signals clock drift, missing `cf-ipcountry`, or sessions expiring before the booking email arrives.
- **Defer new third-party scripts**: load any future tracking/widgets with the `requestIdleCallback` + first-interaction pattern used for GTM. Eager loading inflates the TBT budget Lighthouse measures.
