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

> **Agentic booking roadmap**: see [`docs/agentic-booking-roadmap.md`](docs/agentic-booking-roadmap.md) — phased plan from Marin confirmed bookings (Beds24 write tool + Stripe Payment Link) through MCP endpoint to full OAuth/OIDC.

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
  - **Experience details section** — `DEVOCEAN_SYSTEM_PROMPT` contains a named "Experience details" block with specific facts for all six activity types: scuba diving (named sites with depths, 19 shark species, seasonal windows, pricing), wild dolphin swims (200+ resident population, ethical guidelines, pricing, max group size), whale watching/seafari (30,000 humpback whales Jul–Nov, whale behaviours, pricing), game safari (UNESCO 2025, 450–500 elephants, day trip pricing), deep sea fishing (species by season, charter rates), surfing (point break specs, lesson/hire pricing). Marin must only state facts present in the prompt (CRITICAL ACCURACY RULE) — if a new activity detail is added to the website or `experienceDetails.js`, it must also be added here or Marin will deflect rather than answer.
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
- **Cloudflare**: CF Pages hosts the website; CF Functions handle `/api/contact`, `/api/experience-inquiry`, and the `_middleware.js` pipeline. Security settings configured on the zone:
  - HSTS: `max-age=31536000; includeSubDomains; preload`
  - Minimum TLS: 1.2; X-Content-Type-Options: nosniff; Certificate Transparency Monitoring: on
  - `security.txt` managed via Cloudflare dashboard (Security Center → Security.txt); contact `mailto:info@devoceanlodge.com`, expires annually
  - **WAF custom rule** (order 1, active): `cf.verified_bot_category eq "Search Engine Crawler"` → Skip managed rules + Super Bot Fight Mode. Required because Cloudflare's built-in managed rules were blocking Bingbot (`40.77.x.x`) with 403 and challenging Googlebot (`74.125.x.x`). Do not delete this rule.
  - `Content-Signal: ai-train=no, search=yes, ai-input=yes` declared in both `robots.txt` (required by isitagentready.com agent-readiness checker) and as an HTTP response header in `_middleware.js` (dual placement per the IETF draft spec). Bing's robots.txt parser flags it as an unknown directive (1 validation warning) but does NOT block crawling.
  - **DNS records that must stay DNS-only (grey cloud):**
    - `smtp.devoceanlodge.com` A record — mail server IP. Proxying breaks SMTP (ports 25/465/587 are not handled by Cloudflare's proxy).
    - `f56dc46d7d18a02a27341ac745e2a36b.devoceanlodge.com` CNAME → `verify.bing.com` — Bing Webmaster Tools domain verification. Proxying returns Cloudflare IPs instead of the CNAME chain, breaking Bing's periodic ownership re-check.
- **Booking platforms**: QR codes for Booking.com, Google Reviews, TripAdvisor.
- **Dev tools**: Replit plugins (runtime-error-modal, cartographer, dev-banner — dev only); TS strict; drizzle-kit migrations.

## Feature & Performance Notes (WebsiteProject)

> Full detail in [`docs/performance.md`](docs/performance.md). Covers: lazy loading rules, hero image focal points, Hero Overlay + LCP constraints, Consent & Analytics deferral, GA4 Attribution Pipeline, Native Direct Booking, Discount Codes, Gift Vouchers, Date Range Picker, Mobile Menu Accessibility.

### GEO / AI Visibility (static crawler pages)

AI crawlers (ChatGPT, Perplexity, Gemini, etc.) cannot execute JavaScript, so all React/Wouter SPA routes return an empty shell. The fix is static HTML files at the same URL paths — CF Pages Pretty URLs serves `foo.html` at `/foo` with no `.html` in the URL, and static files take priority over the SPA fallback.

**Static pages added (all in `WebsiteProject/`):**
- `ponta-do-ouro.html` → `/ponta-do-ouro` — destination guide; `TouristDestination` + `FAQPage` JSON-LD (7 Q&As covering beaches, marine life, wildlife, culture, best time to visit).
- `experiences/diving.html` → `/experiences/diving` — `TouristAttraction` + `FAQPage`; named dive sites with depths, 19 shark species, seasonal windows, pricing.
- `experiences/dolphins.html` → `/experiences/dolphins` — 200+ resident dolphin population, ethical guidelines, pricing, peak season.
- `experiences/seafari.html` → `/experiences/seafari` — 30,000 humpback whales Jul–Nov, whale behaviours, whale sharks/mantas/dolphins calendar, pricing.
- `experiences/safari.html` → `/experiences/safari` — Maputo National Park UNESCO 2025, 450–500 elephants, full wildlife list, day trip pricing.
- `experiences/fishing.html` → `/experiences/fishing` — species by season (marlin/sailfish/tuna), charter rates, beach fishing.
- `experiences/surfing.html` → `/experiences/surfing` — point break specs (100–200m rides, up to 1km), surf spots graded by level, lesson/hire pricing.

**Schema also added to existing static pages:**
- `index.html` — `TouristDestination` block added alongside the existing `LodgingBusiness` schema.
- `safari.html`, `comfort.html`, `cottage.html`, `chalet.html` — `FAQPage` JSON-LD (5 unit-specific Q&As each) + cross-link to `/ponta-do-ouro`.

**Static page template pattern** (follow when adding new pages):
- Head: delayed GTM (`GTM-532W3HH2`), CookieYes (`f0a2da84090ecaa3b37f74af`), Trustindex richsnippet, Inter font via Google Fonts, inline CSS with `:root { --brand: #9e4b13; ... }`.
- JSON-LD: `TouristAttraction` (or `TouristDestination`) + `FAQPage` as separate `<script type="application/ld+json">` blocks.
- Canonical: `https://devoceanlodge.com/<path>` (no `.html`).
- Sitemap: add to `public/sitemap.xml` with `<lastmod>` and `<priority>0.9</priority>`.
- Cross-link: every experience page links back to `/ponta-do-ouro`; every accommodation page links to `/ponta-do-ouro`.

## Maintenance Guidelines

- **Keep the hero asset lightweight**: any image replacing `hero01-mobile.webp` must stay under 15 KB compressed. The 5 s overlay delay is tuned to a ~1.5 s load on Slow 4G.
- **Monitor attribution match rate**: check Render logs for `matchBookingSession`. The 30-min language + country window should bind most confirmed bookings to a `client_id`. A low rate signals clock drift, missing `cf-ipcountry`, or sessions expiring before the booking email arrives.
- **Defer new third-party scripts**: load any future tracking/widgets with the `requestIdleCallback` + first-interaction pattern used for GTM.
- **Render Blueprint sync**: when adding new env vars to `render.yaml`, verify the service `name` and `type` match the live Render service exactly before pushing — a mismatch silently creates a duplicate service rather than erroring.
- **GEO static pages ↔ Marin prompt ↔ experienceDetails.js must stay in sync**: three places hold activity facts — the static `experiences/*.html` pages, `DEVOCEAN_SYSTEM_PROMPT` in `voice-reception/artifacts/api-server/src/routes/openai.ts`, and the source data in `WebsiteProject/src/data/experienceDetails.js`. When any fact changes (pricing, seasonal window, operator, site name), update all three. Marin's CRITICAL ACCURACY RULE means she can only state what is in her prompt — an outdated prompt causes deflection rather than answers.
- **Adding a new static experience page**: (1) create `WebsiteProject/experiences/<slug>.html` following the existing template pattern (see GEO / AI Visibility section above), (2) add to `public/sitemap.xml` with `lastmod` today and `priority 0.9`, (3) add the relevant facts to Marin's system prompt experience section, (4) add a cross-link back to `/ponta-do-ouro` in the page CTA.
- **Marin VAD tuning**: VAD threshold and silence window live in `SERVER_VAD` const at the top of `openaiRealtimeRelay.ts` (currently `threshold: 0.65`, `silence_duration_ms: 600`). The response-level mute means these only affect user-turn detection between Marin's responses, not during them.
- **LanguageTopBar mobile overflow**: on viewports < 640px the topbar flex row needs ~317px (left icons + Globe + Region select 140px + Lang select 93px + gaps) but a 320px screen with `px-4` padding only provides 288px — causing 29px of horizontal page overflow. Fix: Globe icon and region select use `hidden sm:block`; on mobile only the 93px language select is shown (~183px total). Region is auto-detected by IP so hiding the selector on small screens is acceptable. If you add new controls to the right-hand group in `LanguageTopBar.jsx`, budget against the ~189px remaining at 320px (288px content − 99px right group).
