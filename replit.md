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
Deep CLS/LCP reasoning lives in `.agents/memory/hero-overlay-lcp.md` + `hero-cls-fix.md`; the durable rules:
- `#hero-placeholder` is a static HTML div (not React), `position: fixed; z-index: 9999`, showing a preloaded hero image dismissed by a CSS compositor animation. It holds only a real `<h1 id="hero-title">` + `<p id="hero-subtitle">` (lodge name + tagline). **Keep those IDs** — the localization inline script rewrites them to the visitor's language.
- **LCP is the static `#hero-title` text, NOT the hero image** (a full-viewport `<img>` is excluded from LCP by Chrome's "full-viewport = background" heuristic — it only counts toward FCP). **No image change (resolution/aspect/asset) can ever fix hero LCP.** The enlarged `#hero-title` clamp (`clamp(3.5rem, 14vw, 3.75rem)`) is kept by owner preference for looks; the React `HeroSection` h1 must mirror that **exact** clamp to avoid a shrink-jump at the fade.
- **Mobile (`<640px`) hides `#hero-title`** (owner pref: lodge name already shows in the header, so the large hero repetition is dropped on phones). React h1 is `hidden sm:block`; placeholder uses `@media (max-width:639.98px){ #hero-title{ display:none } }`. The h1 stays in the DOM (display:none) so the SEO h1 + localization (`textContent`) are preserved. **Consequence: on mobile the LCP element becomes the static `#hero-subtitle`** (still raw HTML, paints early); desktop LCP is still `#hero-title`. Watch a mobile Lighthouse run that the late CookieYes banner doesn't reclaim LCP from the now-smaller subtitle (TCF disabled keeps this safe).
- **Do NOT re-enable CookieYes IAB TCF v2.3**: it fetches the ~118 KiB IAB Global Vendor List and renders a near-full-screen consent paragraph that won LCP (~10 s on Slow 4G). Disabled in the CookieYes dashboard (Jun 2026) → standard GDPR banner, LCP collapses to `#hero-title` (~1.7–2.5 s). DEVOCEAN runs only GA4/GTM (needs Google Consent Mode, not TCF).
- **5 s overlay delay is for FCP / intro UX, not LCP**: `hero01-mobile.webp` loads ~1.5 s on Slow 4G; the overlay stays `opacity: 1` so the image is the FCP paint. Animation `heroDismiss 0.4s cubic-bezier(0.25,1,0.5,1) 5s forwards` (`will-change: opacity`); JS `setTimeout` is cleanup-only at 5500 ms. Returning visitors: `animation = 'none'` → never seen.
- **Padding must match (CLS)**: placeholder `#hero-placeholder-content` and React `HeroSection` must land `#hero-title` at the same viewport Y in every breakpoint band (exact values in "Hero CTA / review-block overlap" below). Placeholder adds `--stack-h`; React adds `--header-h` (the 40px in-flow topbar offsets it). **Do NOT give `HeroSection` paddingTop `--stack-h`** — double-counts the topbar → CLS jump on fade.
- **`HeroSection` uses `items-start`, NOT `items-center`** — flex centering shifts hero text when content height changes (translations loading). Do NOT revert.
- **`#root` is NOT hidden** during the overlay. Do NOT reintroduce `html.hero-active #root { opacity: 0 }` — it delays LCP by hiding paint candidates.
- **Homepage guard**: the inline script bails (injects `#hero-placeholder{display:none!important}`) on any path other than `/` **and** on a `/` load carrying a section hash (`window.location.hash.length > 1`, e.g. `/#experiences`) — without it a deep link would flash the homepage hero for 5 s. A plain `/` shows the overlay normally.

### Hero CTA / review-block overlap (small phones)
- The review block (stars + Trustindex widget) in `HeroSection.jsx` is `absolute bottom-20 sm:bottom-10`, anchored to the **section bottom**; the CTA grid flows from the top. The enlarged 2-line title + a large top gap pushed the CTAs into the block on small phones.
- **Fix = shrink the top gap on small phones (`<640px`), desktop untouched.** Content div top padding: `pt-[calc(var(--header-h)_-_1rem)] sm:pt-[calc(var(--header-h)_+_4rem)]` — mobile shifts content **up 80px** vs the old `+4rem`; `sm:`+ keeps `+4rem`. The h1 still clears the fixed header via its own `mt-14`. To dial it, make the `-1rem` term more negative. **Width-scope only** — an earlier `max-height:800px`-scoped hack never fired on phones >800px tall (where the overlap was reported). Where content < viewport (`min-h-screen`) the bottom-anchored block stays put, so moving content up directly buys clearance.
- **CLS lockstep**: the static placeholder must mirror this — `#hero-placeholder-content` is `calc(var(--stack-h) + 4rem)` desktop / `calc(var(--stack-h) - 1rem)` at `@media (max-width:639.98px)` (`639.98`, not `639`, to exactly complement Tailwind `sm:` = `min-width:640px`). Change the React mobile padding → change this rule by the same amount, or the title jumps on fade. CSS vars: `--topbar-h:40px`, `--header-h:56/64px`, `--stack-h:96/104px` (≥768px).
- **Mobile title removal + subtitle reflow** (`<640px`): with `#hero-title` hidden, the subtitle takes the title's top slot. React subtitle is `mt-14 sm:mt-4 text-xl` (mobile top margin 3.5rem = the title's old `mt-14`; `text-xl`/1.25rem at **all** widths so React matches the placeholder size and there's no fade-shrink). Placeholder mirror: `#hero-placeholder #hero-subtitle{ margin-top:1rem }` (2-ID selector to beat `#hero-placeholder p{ margin:0 }`) + `3.5rem` inside the `639.98px` query. Both layers land the subtitle at the same Y (≈136px) → no fade jump. The CTA grid reflows up automatically, gaining clearance from the bottom-anchored review block (the title's freed height is the buffer). **Tune knob: mobile subtitle gap = `mt-14` in React ↔ `3.5rem` in the placeholder `@media` — change in lockstep.**

### Script-at-bottom + modulePreload
- The React entry `<script type="module">` lives at the **very bottom of `<body>`** in `index.html` (after the placeholder + inline scripts); a custom `moveScriptToBody` plugin in `vite.config.js` re-appends the built entry there.
- `build.modulePreload: { polyfill: false }` keeps Vite's `<link rel="modulepreload">` hints for vendor chunks (react-vendor, icons, framer) so they download in parallel with the entry. **Do NOT set `modulePreload: false`** — that removes the hints and creates a sequential waterfall (React render ~3s → ~6–7s).

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
- **Guest currency override (display only)**: top-bar `CurrencyPicker.jsx` country picker forces a country's national currency (`CC_TO_CURRENCY`) as the *display* currency only — offers still render in `room.currency` (Beds24 base) and Stripe always charges base; it only retargets the approximate FX line + label. Persisted via `setCurrency()` in `useLocale.js` with `site.currency.source="user"` so the IP initializer never clobbers it (mirrors `site.lang_source`). Shown on all viewports; brand text truncates (`min-w-0`/`truncate`), picker group is `shrink-0`, dropdown is `w-[calc(100vw-2rem)] max-w-[18rem]` right-anchored (fits sub-320px). Strings `currencyLabel`/`currencySearch`/`currencyNoMatches` are part of the full booking string set (all 20 base langs); country names via `Intl.DisplayNames`.

### Date Range Picker (book-direct search)
- `DateRangePicker.jsx` is a single dual-month range calendar (1 month mobile, 2 at `lg:`+) replacing native date inputs. Built on **luxon** (no react-day-picker available); Monday-first weeks, names localized via `DateTime.setLocale(lang)` / `Info.weekdays`.
- Dates stay `YYYY-MM-DD` strings — picker is UX-only, so `/api/booking/{availability,checkout}` payloads and `{checkIn} → {checkOut}` displays are untouched.
- First day click commits check-in with a default 1-night checkout (so an incomplete selection still submits a valid ≥1-night range); the second click sets checkout and closes; clicking a date `<= pendIn` restarts. Checkout is always strictly after check-in.
- Popover mirrors `CurrencyPicker` (opacity/visibility/pointerEvents/transform for INP; mousedown + Escape close; accent `#9e4b13`). Panel `w-[calc(100vw-3rem)] max-w-[20rem] lg:w-auto`, left-anchored, fits ~320px.
- **Rate-tier coloring**: day cells are tinted by relative rate tier (Blue=lowest … Red=peak), derived LIVE from Beds24 per-date rates — display-only, never affects checkout/Stripe amounts. Backend `getPriceCalendar` (`beds24.ts`) → `GET /api/booking/calendar` (admin-keyed, rate-limited); `BookDirectPage.jsx` fetches once on mount (fail-soft) and passes `priceByDate` to the picker. Bucketing: distinct-value map if ≤5 unique prices, else p5/p95-trimmed equal-width bands (<2 unique → no color). Cell precedence: disabled > endpoint > inRange > today+tint > tint > default.
- **i18n**: the direct-booking copy (`STRINGS` + `CONFIRM_STRINGS` in `bookingStrings.js`) is now authored for **all 20 base langs** (en, pt, de, fr, es, it, nl, sv, pl, ro, sr, hr, cs, tr, ja, zh, ru, af, zu, sw) — previously only 7, expanded once the old Beds24 7-locale limit was dropped. `getBookingStrings`/`getConfirmStrings` still do a whole-object EN fallback for any unexpected code, and each language object must carry **every** key (a partial object renders `undefined`, not English). The rate-tier labels (`rateLegendTitle` + `rateTiers`) remain a separate `RATE_TIER_STRINGS` overlay (also all 20), merged on top by `getBookingStrings`. Stripe checkout `locale` (`toStripeLocale`) maps the langs Stripe supports; sr/af/zu/sw fall back to Stripe `'auto'` (our page copy is still localized).

### Mobile Menu Accessibility
- `#mnav` drawer is always in the DOM (CSS transform/opacity) to avoid hydration lag / INP regressions. When closed: `inert=""` removes children from the tab ring + a11y tree and `visibility: hidden` releases retained focus. Do NOT reintroduce `aria-hidden` — it triggered a Chrome WAI-ARIA warning when a focused descendant was hidden.

## Maintenance Guidelines

- **Keep the hero asset lightweight**: any image replacing `hero01-mobile.webp` must stay under 15 KB compressed. The 5 s overlay delay is tuned to a ~1.5 s load on Slow 4G; a heavier image needs a longer delay (hurts perceived performance).
- **Monitor attribution match rate**: check Render logs for `matchBookingSession`. The 30-min language + country window should bind most confirmed bookings to a `client_id`. A low rate signals clock drift, missing `cf-ipcountry`, or sessions expiring before the booking email arrives.
- **Defer new third-party scripts**: load any future tracking/widgets with the `requestIdleCallback` + first-interaction pattern used for GTM. Eager loading inflates the TBT budget Lighthouse measures.
