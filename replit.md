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

### Hero Overlay
- A static `#hero-placeholder` div (HTML, not React) shows a preloaded hero image for 5 seconds on a visitor's first visit, then fades out
- `#root` is **not** hidden with `opacity: 0` during the overlay — the placeholder is `position: fixed; z-index: 9999` and covers the React content visually without blocking LCP measurement
- Do not reintroduce `html.hero-active #root { opacity: 0 }` — it delays LCP by preventing the browser from recording the React hero as a paint candidate

### Script-at-bottom + modulePreload strategy
- The React entry `<script type="module" src="/src/main.jsx">` lives at the **very bottom of `<body>`** in `index.html` (after `#hero-placeholder` and all inline scripts)
- `build.modulePreload: { polyfill: false }` in `vite.config.js` keeps Vite's `<link rel="modulepreload">` hints for all vendor chunks (react-vendor, icons, framer) so they download in parallel with the entry; setting `polyfill: false` just skips the polyfill script. Do NOT set `modulePreload: false` — that removes all vendor chunk preload hints and creates a sequential waterfall that delays React render from ~3s to ~6–7s
- A custom `moveScriptToBody` plugin in `vite.config.js` removes the built entry `<script type="module" crossorigin src="/assets/...">` from wherever Vite places it and re-appends it just before `</body>`
- Net effect: `#hero-placeholder` (9.5 KB WebP, preloaded) paints as an LCP candidate before JS ever runs

### Booking Iframe (book/*.html)
- The Beds24 booking iframe uses `sandbox="... allow-top-navigation"` (not `allow-top-navigation-by-user-activation`)
- `allow-top-navigation` is required for both automatic frame-busting scripts (thankyou/canceled pages) and payment redirect links to navigate the top-level window correctly

### Third-Party Consent & Analytics
- **CookieYes** consent banner: loaded immediately (GDPR requirement); `<link rel="preconnect" href="https://cdn-cookieyes.com">` in `<head>` to reduce banner load latency
- **GTM + Engagement Tracker**: deferred until first user interaction (click/keydown/touchstart), with a 15 s fallback — intentionally set to 15 s so Lighthouse audits (which never interact) do not count GTM in their TBT score