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
  - `Content-Signal: ai-train=no, search=yes, ai-input=yes` injected as an HTTP response header in `_middleware.js` (not in robots.txt — that is an invalid placement and causes robots.txt parse errors).
  - **DNS records that must stay DNS-only (grey cloud):**
    - `smtp.devoceanlodge.com` A record — mail server IP. Proxying breaks SMTP (ports 25/465/587 are not handled by Cloudflare's proxy).
    - `f56dc46d7d18a02a27341ac745e2a36b.devoceanlodge.com` CNAME → `verify.bing.com` — Bing Webmaster Tools domain verification. Proxying returns Cloudflare IPs instead of the CNAME chain, breaking Bing's periodic ownership re-check.
- **Booking platforms**: QR codes for Booking.com, Google Reviews, TripAdvisor.
- **Dev tools**: Replit plugins (runtime-error-modal, cartographer, dev-banner — dev only); TS strict; drizzle-kit migrations.

## Feature & Performance Notes (WebsiteProject)

> Full detail in [`docs/performance.md`](docs/performance.md). Covers: lazy loading rules, hero image focal points, Hero Overlay + LCP constraints, Consent & Analytics deferral, GA4 Attribution Pipeline, Native Direct Booking, Discount Codes, Gift Vouchers, Date Range Picker, Mobile Menu Accessibility.

## Maintenance Guidelines

- **Keep the hero asset lightweight**: any image replacing `hero01-mobile.webp` must stay under 15 KB compressed. The 5 s overlay delay is tuned to a ~1.5 s load on Slow 4G.
- **Monitor attribution match rate**: check Render logs for `matchBookingSession`. The 30-min language + country window should bind most confirmed bookings to a `client_id`. A low rate signals clock drift, missing `cf-ipcountry`, or sessions expiring before the booking email arrives.
- **Defer new third-party scripts**: load any future tracking/widgets with the `requestIdleCallback` + first-interaction pattern used for GTM.
- **Render Blueprint sync**: when adding new env vars to `render.yaml`, verify the service `name` and `type` match the live Render service exactly before pushing — a mismatch silently creates a duplicate service rather than erroring.
- **Marin VAD tuning**: VAD threshold and silence window live in `SERVER_VAD` const at the top of `openaiRealtimeRelay.ts` (currently `threshold: 0.65`, `silence_duration_ms: 600`). The response-level mute means these only affect user-turn detection between Marin's responses, not during them.
