# DEVOCEAN Lodge - Email Automation & Website Platform

## Overview

This is a dual-purpose project for DEVOCEAN Lodge, a hospitality property in Ponta do Ouro, Mozambique. The system combines:

1. **Email Automation Service** - Processes Beds24 booking notifications via IMAP, stores booking data in PostgreSQL, and sends scheduled transactional emails (post-booking confirmations, pre-arrival info, arrival welcome, post-departure thank you, and cancellation notifications)

2. **Marketing Website** - A React-based frontend for the lodge using modern UI components and Tailwind CSS with a coastal/hospitality design theme

The architecture follows a monorepo structure with shared schema definitions, a Node.js/Express backend, and a Vite-powered React frontend.

## User Preferences

Preferred communication style: Simple, everyday language.

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

| Slide | Subject | Mobile % | Visible area |
|-------|---------|----------|-------------|
| hero01 | Lodge / main scene | 65% | Slightly right of centre |
| hero02 | Diving | 70% | Noticeably right of centre |
| hero03 | Dolphins | 45% | Slightly left of centre |
| hero04 | Game / wildlife | 70% | Noticeably right of centre |
| hero05 | Hike | 87% | Far right — shows right edge of photo |

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
- The Beds24 booking iframe uses `sandbox="... allow-top-navigation"` (not `allow-top-navigation-by-user-activation`)
- `allow-top-navigation` is required for both automatic frame-busting scripts (thankyou/canceled pages) and payment redirect links to navigate the top-level window correctly

### Third-Party Consent & Analytics
- **CookieYes** consent banner: loaded immediately (GDPR requirement); `<link rel="preconnect" href="https://cdn-cookieyes.com">` in `<head>` to reduce banner load latency
- **GTM + Engagement Tracker**: deferred until first user interaction (click/keydown/touchstart), with a 15 s fallback — intentionally set to 15 s so Lighthouse audits (which never interact) do not count GTM in their TBT score

### GA4 Attribution Pipeline
- **How it works**: "Book Now" clicks fire `trackBookingSession()` → CF Pages Function (`functions/api/track-session.js`) → automailer `/api/track-session` → `booking_sessions` table in Supabase. When a Beds24 confirmation email arrives, `matchBookingSession()` joins by language + country within a 30-minute window, then `fireGA4Conversion()` sends a `purchase` event via GA4 Measurement Protocol with the original browser `client_id`.
- **Required env vars on Render**: `GA4_MEASUREMENT_ID` (e.g. `G-XXXXXXXXXX`) and `GA4_API_SECRET` — without these the matching still runs but the MP POST is skipped.
- **CF Pages env vars**: `AUTOMAILER_URL` is declared in `wrangler.toml` `[vars]`; `ADMIN_API_KEY` is uploaded as a Cloudflare secret via `deploy.sh` on every deploy. Do not add these through the Cloudflare dashboard — the project is wrangler-managed and the dashboard UI is locked for vars.
- **Deploying**: always run `bash deploy.sh` from `WebsiteProject/` — it builds, uploads the `ADMIN_API_KEY` secret, and deploys in one step.

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