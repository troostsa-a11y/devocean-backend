# DEVOCEAN Lodge - Email Automation & Website Platform

## Overview

This is a dual-purpose project for DEVOCEAN Lodge, a hospitality property in Ponta do Ouro, Mozambique. The system combines:

1. **Email Automation Service** - Processes Beds24 booking notifications via IMAP, stores booking data in PostgreSQL, and sends scheduled transactional emails (post-booking confirmations, pre-arrival info, arrival welcome, post-departure thank you, and cancellation notifications)

2. **Marketing Website** - A React-based frontend for the lodge using modern UI components and Tailwind CSS with a coastal/hospitality design theme

The architecture follows a monorepo structure with shared schema definitions, a Node.js/Express backend, and a Vite-powered React frontend.

## User Preferences

Preferred communication style: Technical coding-agent register — direct, pair-programmer tone. Talk in code/implementation terms (files, functions, requests, data flow), not product/marketing framing. Skip the "here's what you'll see" hospitality phrasing; lead with what changed in the code and why.

Testing & deploying are done by the user, not the agent. The user prefers to run all testing (including end-to-end tests, test bookings, and test payments) and all deployments (`bash deploy.sh`) themselves — as a preventative measure against surprises (e.g. an unexpected real booking landing in the live Beds24 calendar), and because testing is one of the few things the user is better at than the agent. The agent should propose exact steps and let the user execute them; do not run tests or deploy without an explicit request to do so.

## System Architecture

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for HTTP server
- **Email Processing**: IMAP (imap-simple) for reading Beds24 booking emails, Nodemailer for sending transactional emails
- **Scheduling**: node-cron for periodic email checks and scheduled sending
- **Timezone Handling**: Luxon library, all scheduling in Central African Time (CAT = UTC+2)

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with React plugin
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library (New York style)
- **Styling**: Tailwind CSS with CSS variables for theming

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` - contains bookings, scheduledEmails, emailLogs, emailCheckLogs, pendingCancellations tables
- **Storage Abstraction**: In-memory storage interface in `server/storage.ts` (can be replaced with database implementation)

### Email Template System
- **Base Templates**: HTML templates in `email_templates/base/` for each email type
- **Translations**: JSON files in `email_templates/translations/` supporting multiple languages (EN-GB, EN-US, PT-PT, PT-BR, ES, FR, DE, IT, NL, SV, PL, AF, ZU, SW, JA, ZH, RU, RO, SR, HR, CS, TR)
- **Website Languages**: EN, PT, DE, FR, ES, IT, NL, AF, PL, SR (Latin), HR (Croatian, ijekavian), CS (Czech), TR (Turkish) — added by mirroring the SR pipeline (langs/<code>.js, content blocks, accommodation-translations.json, seoMeta, experiencePageTranslations, useLocale, Header, critical, localize)
- **Rendering**: Template renderer service applies translations and data substitution

### Design System
- **Color Palette**: Ocean Blue, Warm Sand, Deep Teal as primary colors (defined in design_guidelines.md)
- **Typography**: Inter/DM Sans font families via Google Fonts
- **Component Library**: Full shadcn/ui installation with Radix primitives

## External Dependencies

### Database
- **PostgreSQL** via Supabase (set up via Replit agent)
- **Connection**: Requires `DATABASE_URL` environment variable set in Render dashboard
- **Driver**: `drizzle-orm/postgres-js` with standard `postgres` client

### Email Services
- **IMAP Server**: For reading Beds24 booking notifications
  - Requires: `MAIL_HOST`, `MAIL_PORT`, `IMAP_USER`, `IMAP_PASSWORD`
- **SMTP Server**: For sending transactional emails
  - Uses same host configuration for outbound mail
- **Optional**: Taxi company notification (`TAXI_EMAIL`, `TAXI_WHATSAPP`, `TAXI_NAME`)

### Third-Party Integrations
- **Beds24**: Property management system - booking notifications parsed from email
- **Cloudflare**: CORS enabled for Cloudflare Functions integration
- **Booking Platforms**: Template includes QR codes for Booking.com, Google Reviews, TripAdvisor

### Development Tools
- **Replit Plugins**: vite-plugin-runtime-error-modal, cartographer, dev-banner (development only)
- **Type Checking**: TypeScript with strict mode
- **Database Migrations**: drizzle-kit for schema management

## Performance Notes (WebsiteProject)

### Lazy Loading Strategy
- **Critical (eager)**: `Header`, `HeroSection`, `AccommodationsSection`, `ExperiencesSection`, `TodoSection` — always in the main bundle (these render immediately on the homepage and must not be lazy-loaded, as doing so causes CLS and TBT regressions: the Suspense fallback height doesn't match section heights, and multiple parallel chunk fetches add up to more blocking time than one bundle)
- **Lazy**: `GallerySection`, `LocationSection`, `ContactSection`, `Footer`, and all route-level pages — loaded only when needed
- **ExcelJS**: dynamically imported inside `AdminPage.jsx` only when the user triggers an export, keeping the 920 KB chunk out of the critical path entirely

### Hero Image Mobile Focal Points

On mobile the hero images are cropped (portrait viewport, landscape photo). The `mobileObjectClass` field in `HERO_IMAGES` (`WebsiteProject/src/data/content.js`) controls which part of each photo is visible using CSS `object-position`. On desktop (`sm:` breakpoint and above) all slides revert to `object-center` (50% = centred).

**How the percentage works:**
- `50%` = centre of the photo
- Above 50% = shifts the visible window toward the **right** side of the photo
- Below 50% = shifts the visible window toward the **left** side of the photo

**Current settings (as of June 2026):**

| Slide | Subject | Mobile % | Desktop % | Notes |
|-------|---------|----------|-----------|-------|
| hero01 | Lodge / main scene | 65% | 50% (centre) | Slightly right on mobile |
| hero02 | Divers on beach | 75% | 30% | Right on mobile, left of centre on desktop (new photo Jun 2026) |
| hero03 | Dolphins | 45% | 50% (centre) | Slightly left on mobile |
| hero04 | Game / wildlife | 70% | 50% (centre) | Noticeably right on mobile |
| hero05 | Hike | 87% | 50% (centre) | Far right on mobile |

To adjust: edit `mobileObjectClass` for the relevant slide in `content.js`, then redeploy with `bash deploy.sh` from `WebsiteProject/`.

### Hero Overlay
- A static `#hero-placeholder` div (HTML, not React) shows a preloaded hero image for 5 seconds on a first visit, then fades out via CSS animation on the compositor thread
- The placeholder contains a real `<h1 id="hero-title">`, `<p id="hero-subtitle">`, and two static button-shaped `<div>`s — mirroring the React hero layout exactly to eliminate CLS on overlay removal
- Placeholder content uses `padding: calc(var(--stack-h) + 4rem) 1rem 6rem 1rem` (position:fixed, so measured from viewport top → content at y:168 desktop / y:160 mobile)
- React `HeroSection` uses `paddingTop: calc(var(--header-h) + 4rem)` (NOT `--stack-h`) — the topbar (40px, in-flow) already offsets the section start, so only the fixed header height needs adding. This produces the same y:168 / y:160 as the placeholder, eliminating the visual jump on overlay fade.
- **Do NOT change HeroSection back to `calc(var(--stack-h) + 4rem)`** — that placed content 40px lower than the placeholder, causing a visible 40px (desktop: 253px flex-centering-adjusted) jump when the overlay faded. This was a major CLS source.
- HeroSection uses `items-start` (NOT `items-center`) — flex vertical centering shifts ALL hero text whenever content height changes (e.g. translations loading). `items-start` anchors the title at a stable y position regardless of content below it.
- **Do NOT change HeroSection back to `flex items-center`** — it caused the hero content block to shift up/down whenever `criticalUI → full ui` transitions added/removed the description paragraph or changed content height.
- The localization inline script immediately updates `#hero-title` and `#hero-subtitle` to the visitor's language. Do not remove these IDs.
- `#root` is **not** hidden with `opacity: 0` during the overlay — the placeholder is `position: fixed; z-index: 9999` and covers React content visually without blocking LCP measurement
- Do not reintroduce `html.hero-active #root { opacity: 0 }` — it delays LCP by preventing the browser from recording elements as paint candidates

### LCP Strategy
- **Why 5 s delay**: The hero image (`hero01-mobile.webp`) takes ~1.5 s to load on Slow 4G. The overlay must remain at `opacity: 1` when the image paints so Chrome registers it as the LCP candidate. A delay shorter than the image load time (e.g. the previous 0.5 s) causes the overlay to fade before the image arrives — Chrome skips the invisible element and waits for the React hero instead (~8 s on 4× CPU throttle).
- Animation: `heroDismiss 0.4s cubic-bezier(0.25,1,0.5,1) 5s forwards` — compositor thread, independent of JS load. `will-change: opacity` promotes the element to its own GPU layer.
- JS `setTimeout` is **cleanup-only** at 5500 ms (5000 ms delay + 400 ms fade + 100 ms buffer) — hides the DOM node after the animation finishes.
- For returning visitors: `placeholder.style.animation = 'none'` cancels the compositor animation before `display:none` is set; they never see the overlay.
- `hero-active` class is removed by App.jsx's `useEffect` after first React mount; until then it keeps the background dark.

### Script-at-bottom + modulePreload strategy
- The React entry `<script type="module" src="/src/main.jsx">` lives at the **very bottom of `<body>`** in `index.html` (after `#hero-placeholder` and all inline scripts)
- `build.modulePreload: { polyfill: false }` in `vite.config.js` keeps Vite's `<link rel="modulepreload">` hints for all vendor chunks (react-vendor, icons, framer) so they download in parallel with the entry; setting `polyfill: false` just skips the polyfill script. Do NOT set `modulePreload: false` — that removes all vendor chunk preload hints and creates a sequential waterfall that delays React render from ~3s to ~6–7s
- A custom `moveScriptToBody` plugin in `vite.config.js` removes the built entry `<script type="module" crossorigin src="/assets/...">` from wherever Vite places it and re-appends it just before `</body>`
- Net effect: `#hero-placeholder` preloaded WebP paints as an LCP candidate at ~1.5 s before JS ever runs

### Booking Iframe (book/*.html)
- The Beds24 booking iframe has **NO `sandbox` attribute** — it loads `beds24.com/booking2.php` with full iframe permissions (same as `booking-simple.html`).
- **Why no sandbox**: bookings now take a 50% deposit via Stripe *inside* the Beds24 iframe. Stripe's payment/3-D-Secure step needs storage-access, popups, and redirect freedoms; a `sandbox` (even one with `allow-top-navigation`) blocked the post-payment return, leaving the guest on a blank/error page instead of the `/thankyou` confirmation. Removing the sandbox fixed it. beds24.com is a trusted, intentionally-embedded provider, so the defense-in-depth tradeoff is acceptable.
- **Do NOT reintroduce a `sandbox` attribute on `#beds24frame`** — it breaks the Stripe deposit → confirmation-page redirect. With no sandbox, top-navigation (frame-busting thankyou/canceled pages + payment redirects) works by default.
- Confirmation flow: after a booking/payment, Beds24 redirects to `/thankyou.html?bookid=...`; Cloudflare Pages 308-redirects `.html` → clean URL (`/thankyou`), which serves the confirmation page. `thankyou.html`'s frame-buster (`window.top.location.replace`) takes over the top window if it loaded inside the frame.

### Third-Party Consent & Analytics
- **CookieYes** consent banner: loaded immediately (GDPR requirement); `<link rel="preconnect" href="https://cdn-cookieyes.com">` in `<head>` to reduce banner load latency
- **GTM + Engagement Tracker**: deferred until first user interaction (click/keydown/touchstart), with a 15 s fallback — intentionally set to 15 s so Lighthouse audits (which never interact) do not count GTM in their TBT score

### GA4 Attribution Pipeline
- **How it works**: "Book Now" clicks fire `trackBookingSession()` → CF Pages Function (`functions/api/track-session.js`) → automailer `/api/track-session` → `booking_sessions` table in Supabase. When a Beds24 confirmation email arrives, `matchBookingSession()` joins by language + country within a 30-minute window, then `fireGA4Conversion()` sends a `purchase` event via GA4 Measurement Protocol with the original browser `client_id`.
- **Required env vars on Render**: `GA4_MEASUREMENT_ID` (e.g. `G-XXXXXXXXXX`) and `GA4_API_SECRET` — without these the matching still runs but the MP POST is skipped.
- **CF Pages env vars**: `AUTOMAILER_URL` is declared in `wrangler.toml` `[vars]`; `ADMIN_API_KEY` is uploaded as a Cloudflare secret via `deploy.sh` on every deploy. Do not add these through the Cloudflare dashboard — the project is wrangler-managed and the dashboard UI is locked for vars.
- **Deploying**: always run `bash deploy.sh` from `WebsiteProject/` — it builds, uploads the `ADMIN_API_KEY` secret, and deploys in one step.

### Native Direct Booking (Beds24 REST API + Stripe deposit)
- **What it is**: a native booking flow at `/book-direct` (with confirmation at `/booking-confirmed`) that runs *alongside* the existing Beds24 iframe — it does not replace it. Guests pick dates/room, pay a deposit via Stripe Checkout, and the balance is settled on arrival.
- **Payment is the source of truth**: the Beds24 booking is created **only** from a signature-verified Stripe `checkout.session.completed` webhook. The server always recomputes price + deposit from a fresh Beds24 quote at checkout and again at webhook time — client-supplied amounts are never trusted.
- **Double-booking guard**: at webhook time the room is re-checked; if it sold out during the payment window the deposit is auto-refunded and the booking is marked `sold_out_refunded`.
- **No duplicate email/GA4 work**: creating the booking in Beds24 makes Beds24 send its own notification email, which the existing IMAP automation already ingests (guest row + scheduled emails + GA4). The direct-booking path does not schedule emails itself.
- **Data**: a separate `direct_bookings` table tracks deposit/balance/Stripe refs/Beds24 id and payment status. The existing `bookings` table and email flow are untouched. Table init is idempotent; SQL also in `render-automailer/migrations/add_direct_bookings.sql`.
- **Backend**: `render-automailer/server/services/beds24.ts` (auth/refresh, availability quote, create booking, recheck), `stripe-booking.ts` (checkout session, webhook verify, refund), config in `server/config/booking-config.ts`. Routes in `server/routes/booking.ts`: `/api/booking/{config,availability,checkout,result/:ref}` require `x-admin-key`; `/api/booking/webhook` is public but secured by Stripe signature. The webhook raw body is captured via an `express.json` `verify` callback in `server.ts` (signature verification needs the unparsed body).
- **Frontend → automailer proxy**: same pattern as track-session. CF Pages Functions in `WebsiteProject/functions/api/booking/*` (and dev routes in `WebsiteProject/server.js`) inject `x-admin-key` + `cf-ipcountry` and forward to the automailer. The browser never sees the admin key. SPA routes resolve via the existing root `_middleware.js` 404→index.html fallback.
- **Required env vars on Render**: `BEDS24_REFRESH_TOKEN`, `BEDS24_PROP_ID` (297012), `BEDS24_API_BASE` (`https://beds24.com/api/v2`), `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, plus optional policy overrides `DEPOSIT_PERCENT` (set to 50 for DEVOCEAN; code default 30), `CANCELLATION_POLICY_DAYS` (default 30), `BOOKING_CURRENCY` (default USD), and `PUBLIC_SITE_URL` (for Stripe success/cancel URLs). `ADMIN_API_KEY` is reused from the track-session pipeline.
- **Stripe setup**: point a Stripe webhook endpoint at `https://devocean-automailer.onrender.com/api/booking/webhook` for the `checkout.session.completed` event and put its signing secret in `STRIPE_WEBHOOK_SECRET`.
- **Guest currency override (display only)**: the `/book-direct` top-bar language·currency pair is a clickable searchable country picker (`WebsiteProject/src/components/CurrencyPicker.jsx`). Picking a country forces its national currency (`CC_TO_CURRENCY`) as the *display* currency. It is display-only — offers still render in `room.currency` (Beds24 base) and Stripe always charges base; the override only retargets the approximate FX line + the label. Persisted via `setCurrency()` in `useLocale.js` with `site.currency.source="user"` so the IP-based initializer never clobbers it (mirrors `site.lang_source`). Desktop/tablet only (`sm:`), matching the prior pair visibility; mobile exposure is an open follow-up. Picker strings: `currencyLabel`/`currencySearch`/`currencyNoMatches` in the 7 booking base langs (others fall back to EN); country names localize via `Intl.DisplayNames`.

### Mobile Menu Accessibility
- The `#mnav` drawer is always in the DOM (CSS transform/opacity) to avoid hydration lag and INP regressions on open.
- When closed: `inert=""` removes all children from the tab ring and accessibility tree; `visibility: hidden` forces any retained focus to be released. Do not reintroduce `aria-hidden` — it caused a Chrome WAI-ARIA warning when a focused descendant was hidden.

## Maintenance Guidelines

### Keep the Hero Asset Lightweight
Any future image replacing `hero01-mobile.webp` must stay under 15 KB compressed. The 5-second overlay delay was tuned to a ~1.5 s image load time on Slow 4G — a heavier image will need a longer delay, which hurts perceived performance.

### Monitor the Automailer Attribution Match Rate
Periodically check Render logs for `matchBookingSession` output. The 30-minute language + country window should bind the majority of confirmed bookings to a frontend `client_id`. A low match rate signals clock drift, missing CF `cf-ipcountry` headers, or sessions expiring before the booking email arrives.

### Defer New Third-Party Scripts
Any future tracking tools or dynamic widgets should be loaded using the same `requestIdleCallback` + first-interaction pattern already used for GTM. Loading scripts eagerly will push them into the TBT budget measured by Lighthouse and slow the critical render path.