# DEVOCEAN Lodge — Technical Asset Description

**Purpose:** A complete reference to the DEVOCEAN Lodge digital platform, written to serve three audiences at once: (1) a buyer or investor performing technical due diligence, (2) an insurer, valuer, or compliance reviewer who needs a clear inventory of assets, data, and risk exposure, and (3) the lodge owner, as a plain-language explanation of what was built and why it matters — without needing to read code.

**Scope:** All three production systems in this monorepo — the marketing website, the email automation service, and the Marin voice receptionist — and how they interact.

**As of:** July 2026.

---

## 0. Executive Summary (plain language)

DEVOCEAN Lodge's digital operation is built from three separate pieces of software that work together. None of it is off-the-shelf booking software (like a Booking.com widget) — it was custom-built specifically for this property.

**1. The website** (`devoceanlodge.com`) is where guests learn about the lodge, browse rooms, and book directly. Booking directly (rather than only through Booking.com/Airbnb) matters commercially because it avoids the ~15-20% commission those platforms charge. A guest can pick dates, pay a deposit by card, and the system automatically checks real-time availability with the property management system (Beds24) so it's impossible to double-book a room online.

**2. The email robot** (internal name: "Automailer") watches the booking inbox and automatically sends guests the right email at the right time — a confirmation after booking, a reminder before arrival, a welcome note on arrival day, and a thank-you after departure — in the guest's own language (20 languages supported). This replaces what would otherwise be manual staff work for every single booking.

**3. Marin, the AI voice receptionist**, is a talking assistant embedded on the website (a microphone button guests can click). She can answer questions about the lodge, check real room availability and pricing live, convert prices between currencies, check the weather, and take down enquiry details — and she emails the owner immediately when she does. She cannot create or cancel a real booking herself; she only ever reads live data and passes enquiries along to a human.

**What runs where:** all three pieces run on paid third-party cloud services (Cloudflare, Render, Supabase, OpenAI, Stripe) rather than on hardware the business owns. There is nothing to physically maintain — the ongoing cost is the sum of these vendors' subscription/usage fees, which the owner should check directly on each vendor's billing dashboard since actual current pricing tiers are not tracked in this document.

**How it's maintained:** the codebase was built and continues to be maintained through Replit's AI coding agent, with the owner directing the work rather than a dedicated in-house or agency development team. This keeps costs low but means continuity depends on either continuing that same workflow or bringing in a developer who can read the reference documentation in this repository (this document, `replit.md`, and `threat_model.md`) to get oriented quickly.

**Bottom line for a buyer or insurer:** the software is a real, working, revenue-relevant asset (it directly drives bookings and reduces commission costs), built entirely with mainstream, replaceable, non-proprietary technology (no exotic frameworks, no vendor lock-in beyond normal SaaS switching costs), and it is reasonably documented. The main things worth confirming independently before a transaction or underwriting decision are listed in §7 (Risk Register).

---

## 1. System Overview

DEVOCEAN Lodge is a hospitality property in Ponta do Ouro, Mozambique. Its digital platform is a monorepo containing three independently deployed services that share a domain (`devoceanlodge.com`) and, in places, a database or API surface:

| # | Component | Directory | Deploys to | Live at |
|---|---|---|---|---|
| 1 | Marketing website + native direct-booking engine | `WebsiteProject/` | Cloudflare Pages (`bash deploy.sh`) | `https://devoceanlodge.com` |
| 2 | Email automation service | `render-automailer/` | Render `web` service "Automailer" (GitHub `main`) | `https://devocean-automailer.onrender.com` |
| 3 | Marin voice receptionist (AI) | `voice-reception/` | Render `web` service "Receptionist" (GitHub `main`) | `https://mia-voice-receptionist.onrender.com` |

### High-level data/request flow

```
Guest browser (devoceanlodge.com)
   ├─► Cloudflare Pages Functions (contact/enquiry forms, booking proxy, FX)
   │        └─► Automailer REST API (x-admin-key injected server-side)
   ├─► Marin widget iframe (/embed) ──► Receptionist (Express + WebSocket relay) ──► OpenAI Realtime API
   │                                         └─► Beds24 API (live availability), Reception Supabase DB
   └─► Stripe Checkout (native direct booking deposit)
            └─► Stripe webhook ──► Automailer (/api/booking/webhook) ──► Beds24 REST API + guest emails + GA4

Beds24 (PMS)
   └─► booking notification emails ──► IMAP ──► Automailer email parser ──► Lodge/Automailer PostgreSQL (Supabase)
                                                        └─► scheduled transactional guest emails (SMTP)
```

The website, automation service, and voice receptionist are **separate deployable units** with independent databases (Automailer and Receptionist each use their own Supabase Postgres project) and independent release cadences.

---

## 2. Component: Marketing Website (`WebsiteProject/`)

### 2.1 Stack
- React 18 + Vite 7 + Tailwind CSS 3, `wouter` for routing, `framer-motion` for animation.
- i18n via `i18next` / `react-i18next` — 20 base languages, 22 locale variants (see §2.4).
- `dompurify` for sanitizing any user-influenced HTML.
- Cloudflare Pages Functions (`functions/api/*`) provide the serverless backend for the site — contact form, experience inquiries, FX conversion, and the native booking proxy.
- Deployed via Wrangler (`wrangler pages deploy dist`), wrapped by `deploy.sh`, which also uploads the `ADMIN_API_KEY` Cloudflare secret in the same step.
- Build output copies several static HTML entry points (`story.html`, `safari.html`, `comfort.html`, `cottage.html`, `chalet.html`, `thankyou.html`, `canceled.html`) alongside the Vite SPA bundle.

### 2.2 Native direct booking (Beds24 + Stripe)
- Flow: `/book-direct` → guest picks dates/room → pays a deposit via **Stripe Checkout** → balance due on arrival → confirmation at `/booking-confirmed`.
- **Payment is the source of truth**: the Beds24 reservation is only created from a signature-verified Stripe `checkout.session.completed` webhook (handled in `render-automailer`, not the website). Prices are recomputed server-side from a fresh Beds24 quote both at checkout creation and again at the webhook — client-submitted amounts are never trusted.
- Double-booking guard: room availability is re-checked at webhook time; if sold out, the Stripe deposit is auto-refunded and the booking is marked `sold_out_refunded`.
- Frontend never talks to Beds24 or holds the admin key directly — Cloudflare Functions in `functions/api/booking/*` act as an authenticated proxy, injecting `x-admin-key` and `cf-ipcountry` server-side.
- Dual-month date-range picker (`DateRangePicker.jsx`) built on **luxon**, with rate-tier colour bucketing sourced from a live Beds24 price calendar.

### 2.3 GA4 attribution pipeline
- "Book Now" clicks fire a client-side `trackBookingSession()` call → CF Function `track-session.js` → Automailer `/api/track-session` → `booking_sessions` table.
- When a Beds24 confirmation email arrives (IMAP path) or a Stripe webhook fires (native path), `matchBookingSession()` / `attributeBooking()` join the session by language + country within a 30-minute window, then `fireGA4Conversion()` sends a `purchase` event via the GA4 Measurement Protocol using the original browser `client_id`.
- Single-fire is enforced via a `ga4_conversion_fired_at` column.

### 2.4 Internationalization
- 20 base languages / 22 locale variants: EN (en-GB, en-US), PT (pt-PT, pt-BR), DE, FR, ES, IT, NL, SV, PL, RO, SR, HR, CS, TR, JA, ZH, RU, AF, ZU, SW.
- Each language carries a full copy of all content objects (accommodation translations, SEO metadata, experience-page translations, booking strings) — partial objects render `undefined` rather than falling back to English, so every new language requires touching every content surface.

### 2.5 Performance engineering
- Deliberate lazy-loading split: `Header`, `HeroSection`, `AccommodationsSection`, `ExperiencesSection`, `TodoSection` are eager (above-the-fold); gallery/location/contact/footer/route pages are lazy; `ExcelJS` (920 KB) is dynamically imported only on admin export.
- Hero image LCP is dominated by the `#hero-title`/`#hero-subtitle` text node, not the hero `<img>` (Chrome's full-viewport-image heuristic excludes it from LCP candidacy) — documented in `.agents/memory/hero-overlay-lcp.md`.
- CookieYes IAB TCF v2.3 is intentionally disabled (was adding ~10 s to LCP on Slow 4G via a 118 KB vendor list fetch); a standard GDPR banner is used instead.
- GTM and the engagement tracker are deferred until first interaction (click/keydown/touchstart) with a 15 s fallback, to keep them out of Lighthouse TBT.

### 2.6 Admin surface
- `AdminPage.jsx` — password/`ADMIN_API_KEY`-protected admin UI covering guest export (CSV/XLSX via lazy-loaded ExcelJS) and a broadcast-email tool (subject/body compose, live preview, per-recipient send progress) that calls Automailer admin endpoints.

---

## 3. Component: Email Automation Service (`render-automailer/`)

### 3.1 Stack
- Node.js + TypeScript, Express 4 (HTTP server), Drizzle ORM over `postgres-js`, deployed to Render (`type: web`, region Frankfurt, plan starter).
- IMAP ingestion via `imap-simple` + `mailparser`; outbound mail via `nodemailer` (SMTP, same host as IMAP) with `resend` available as an alternate provider.
- Scheduling via `node-cron`; all scheduling logic uses **Luxon** and runs in CAT (UTC+2).
- Stripe SDK for the native-booking deposit/webhook flow.

### 3.2 Data model (PostgreSQL / Supabase, Drizzle schema in `render-automailer/shared/schema.ts`)
- `bookings` — canonical booking record (dates, guest, room, status, source).
- `scheduledEmails` — queued transactional emails (post-booking, pre-arrival, arrival welcome, post-departure, cancellation) with send timestamps.
- `emailLogs` — audit trail of sent/failed emails.
- `emailCheckLogs` — IMAP poll run history.
- `pendingCancellations` — cancellation requests awaiting processing/verification.
- `guests` — guest contact/profile data used across bookings.
- `bookingSessions` — GA4 attribution sessions captured from "Book Now" clicks (language, country, `client_id`, timestamp).
- `directBookings` — native `/book-direct` bookings: deposit/balance amounts, Stripe references, Beds24 booking id, status (including `sold_out_refunded`).

### 3.3 Core services (`render-automailer/server/services/`)
- `email-parser.ts` — parses inbound Beds24 booking-notification emails over IMAP (TLS-verified connection).
- `email-automation.ts` — orchestrates the guest email lifecycle and the shared `attributeBooking()` GA4 helper (called from both the IMAP path and the native Stripe-webhook path — the single fire point for native bookings).
- `email-scheduler.ts` / `email-sender.ts` / `email-template-renderer.ts` — cron-driven send queue and HTML template rendering (base templates in `email_templates/base/`, per-language JSON in `email_templates/translations/`).
- `cancellation-handler.ts`, `modification-handler.ts` — process cancellation/modification signals parsed from provider emails.
- `beds24.ts` / `stripe-booking.ts` — Beds24 REST client and Stripe Checkout/webhook handling for native direct bookings.
- `ga4-attribution.ts` — session matching + GA4 Measurement Protocol conversion firing.
- `admin-reporting.ts`, `booking-cart.ts`, `database.ts`, `transfer-notification.ts` — supporting admin/reporting and DB-access utilities.

### 3.4 HTTP surface
- Public: `/health`, native booking routes under `server/routes/booking.ts` (availability/calendar/checkout/webhook), and the CF-proxied `/api/track-session` and contact/inquiry endpoints.
- Admin (protected by `requireAdminKey`, key passed via header — never in the URL): guest export (`/api/admin/guests/export/google`), broadcast email send/test-send, admin reporting.
- Stripe webhook endpoint verifies the Stripe signature before creating any booking or firing any email/GA4 event.

### 3.5 Deployment
- Render service **"Automailer"** (`type: web`), root dir `render-automailer`. Build: `npm install && npm run build` (must run `tsc` to produce `dist/server.js`). Start: `npm start`. Deploys automatically from GitHub `main`.
- Known build-environment gotcha: `express@4` runtime paired with `@types/express@5` and no committed lockfile can pass locally but fail Render's `tsc` on `req.params` typed as `string | string[]` — mitigated by explicit `String(...)` coercion at call sites.

---

## 4. Component: Marin Voice Receptionist (`voice-reception/`)

### 4.1 Stack
- pnpm workspace, Node 24, TypeScript 5.9.
- `artifacts/api-server/` — Express 5 API server (also serves the compiled Vite build as static files, so `/embed`, `/widget-loader.js`, and the admin SPA all come from one Render URL).
- `artifacts/receptionist/` — React 19 + Vite admin dashboard / guest-facing widget.
- `lib/` — shared internal packages: `db` (Drizzle schema + migrations), `api-spec`, `api-client-react`, `api-zod`, `integrations-openai-ai-server`/`-react`.

### 4.2 Data model (dedicated Reception Supabase project, `DATABASE_URL`, separate from the Lodge/Automailer database; session pooler `aws-0-eu-west-3.pooler.supabase.com`)
- `conversations` — one row per voice/chat session.
- `messages` — turn-by-turn transcript per conversation.
- `bookings` — booking enquiries captured by Marin (distinct table from the Automailer `bookings` table — different database, different schema).
- `integration_tokens` — stored tokens for connected integrations.
- Schema managed by Drizzle ORM; migrations in `lib/db/drizzle/` run automatically via `drizzle-orm/migrator` on every server startup — no manual migration step.

### 4.3 AI / voice architecture
- Model: `gpt-realtime-2` via a WebSocket relay (`artifacts/api-server/src/routes/openaiRealtimeRelay.ts`). Voice: `marin`. Bare `gpt-4o-audio-preview` alias is retired (404) — always use a dated alias or `gpt-realtime-2`.
- System prompt built in `artifacts/api-server/src/routes/openai.ts` (`buildSystemPrompt`): injects current CAT time for time-aware greetings, enforces a strict "only state facts present in this prompt" accuracy rule, and covers lodge details, room rates/seasons, airport transfers, Mozambique visa/entry requirements, currency conversion, and live weather.
- Server-side VAD (voice activity detection): `threshold: 0.65`, `silence_duration_ms: 600`, fully muted for the duration of every Marin response (`response.created`→mute, `response.done`→unmute) to prevent Marin's own speaker output from being misdetected as user speech. A `sessionGreetingSent` guard prevents the VAD mute/unmute `session.update` calls from re-triggering the opening greeting in a loop.
- Tools exposed to the model: `check_availability` (live Beds24 pricing/availability, read-only — Marin never creates bookings), `convert_currency` (live FX), `get_weather` (current + 3-day forecast), `save_booking_enquiry` (persists enquiry + fires a fire-and-forget SMTP alert email to the lodge owner).
- Browser mic capture: `echoCancellation`, `noiseSuppression`, mono channel; PCM16 audio piped via `ScriptProcessorNode` → base64 → WebSocket.

### 4.4 Widget embed
- `widget-loader.js` (served from `artifacts/receptionist/public/`) injects a floating mic button on the website that opens an iframe pointing at `/embed` on the Receptionist's own origin.
- `WebsiteProject/index.html` references the script via a `%%MIA_URL%%` build-time token, substituted by Vite at website build time — a legacy internal name (Marin was previously called "Mia"); no user-visible strings still say "Mia".

### 4.5 Deployment
- Render service **"Receptionist"** (`type: web`), root dir `voice-reception`. Build installs pnpm, runs `pnpm install --frozen-lockfile && pnpm run typecheck && pnpm run build`. Start: `node --enable-source-maps ./artifacts/api-server/dist/index.mjs`. Health check: `/api/health`. Deploys automatically from GitHub `main`.
- Render Blueprint gotcha (applies to both Render services): the `name` and `type` fields in `render.yaml` must match the existing Render service exactly, or Render creates a duplicate service instead of updating the existing one.

---

## 5. Cross-Cutting Concerns

### 5.1 Environment variables / secrets (names only — see `environment-secrets` tooling for values)
- **Website (Cloudflare)**: `AUTOMAILER_URL` (`wrangler.toml`, public var), `ADMIN_API_KEY` (Cloudflare secret, uploaded by `deploy.sh`).
- **Automailer (Render)**: `DATABASE_URL`, `MAIL_HOST`, `MAIL_PORT`, `SMTP_PORT`, `IMAP_HOST`, `IMAP_PORT`, `IMAP_USER`, `IMAP_PASSWORD`, `IMAP_TLS`, `IMAP_FROM_EMAIL`, `IMAP_FROM_NAME`, `ADMIN_EMAIL`, `BCC_EMAIL`, `TAXI_EMAIL`, `TAXI_WHATSAPP`, `TAXI_NAME`, `GA4_MEASUREMENT_ID`, `GA4_API_SECRET`, `BEDS24_REFRESH_TOKEN`, `BEDS24_PROP_ID`, `BEDS24_API_BASE`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, optional `DEPOSIT_PERCENT`, `CANCELLATION_POLICY_DAYS`, `BOOKING_CURRENCY`, `PUBLIC_SITE_URL`.
- **Receptionist (Render)**: `DATABASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`, `OPENAI_REALTIME_MODEL`, `OPENAI_TEXT_MODEL`, `BEDS24_TOKEN`/`BEDS24_INVITE_CODE`, `BEDS24_PROPERTY_ID`, `LOG_LEVEL`, `NOTIFY_SMTP_HOST`, `NOTIFY_SMTP_PORT`, `NOTIFY_SMTP_USER`, `NOTIFY_SMTP_PASS`, `NOTIFY_EMAIL_FROM`, `NOTIFY_EMAIL_TO`, optional `MARIN_NOTIFY_WA_PHONE`/`MARIN_NOTIFY_WA_APIKEY`.
- Principle observed throughout: admin/API keys are passed as headers, never in URLs (avoids leaking into logs/browser history); the browser never holds the Beds24, Stripe secret, or admin keys directly.

### 5.2 External dependencies / integrations
- **Beds24** — property management system; source of truth for availability/pricing, read via REST API (live queries) and via parsed IMAP notification emails (legacy/parallel path).
- **Stripe** — Checkout + webhooks for native direct-booking deposits.
- **OpenAI** — Realtime audio model (`gpt-realtime-2`) powering Marin.
- **Supabase** — two separate Postgres projects (Lodge/Automailer DB; Reception DB for Marin).
- **Cloudflare** — Pages hosting + Functions (serverless backend for the website) + CORS.
- **GA4 (Measurement Protocol)** — server-side purchase-event attribution.
- **Resend** — alternate/optional outbound email provider alongside SMTP/nodemailer.

### 5.3 Security posture (see `threat_model.md` for full detail)
- Trust boundaries treat all browser input, all inbound IMAP mail content, and all public HTTP requests to the Automailer as untrusted until authenticated or verified.
- State-changing actions (cancel/modify a booking, trigger automation, export guest data, send broadcast email) require `requireAdminKey` server-side authorization — never inferred from client-supplied fields.
- Stripe webhook events are signature-verified before any booking is created; booking prices are always recomputed server-side from a live Beds24 quote, never trusted from the client.
- IMAP connection to the mail server uses standard TLS certificate validation (a forged mail server could otherwise feed the parser attacker-controlled "booking" content).
- CSV/spreadsheet exports of guest data neutralize formula injection, since guest-supplied text is untrusted when opened by staff.
- Admin secrets are never placed in query strings.

### 5.4 Known technical debt / operational notes
- Three independent deployables with three different deploy mechanisms (Cloudflare Wrangler, Render Blueprint ×2) — a `render.yaml` service-name/type mismatch silently creates a duplicate Render service rather than erroring.
- Marin's booking table and the Automailer's booking table are same-named (`bookings`) but live in different databases with different schemas — do not assume shared identity across the two systems.
- Website build/dev is orchestrated by `start.js`; some legacy top-level files (`server.ts`, `server/`, `shared/`, `.tar`/`.tar.gz` archives, `_Archive/`) are historical/dev-only artifacts not part of the current production path — see `threat_model.md`'s "usually dev-only unless proven otherwise" note before treating them as live surfaces.
- Full 20-language content parity is a manual-maintenance burden: every new content field must be added to every language object, or it silently renders `undefined` for languages not yet updated.

---

## 6. Valuation, Compliance & Business Continuity Notes

This section is aimed at a due-diligence, insurance, or valuation reviewer who needs to know what is owned, what is exposed, and what depends on a third party.

### 6.1 Ownership and portability
- The entire codebase (all three components) is custom-built and owned by the lodge; there is no external agency retaining IP rights and no proprietary/licensed framework involved.
- The stack is mainstream and portable: Node.js, TypeScript, React, PostgreSQL, Express. None of it is tied to Replit specifically — it can be exported and run on any standard Node hosting provider or self-hosted, subject to re-pointing the third-party service credentials listed in §5.1.
- No software patents, trademarks, or open-source licensing obligations beyond standard permissive (MIT-style) npm dependencies are known to apply.

### 6.2 Data privacy exposure
- Guest personal data collected and stored: name, email, phone number, booking dates, room/unit, language, IP address (for spam/attribution purposes), and free-text enquiry/message content. Stored in two separate Supabase PostgreSQL databases (Lodge/Automailer DB; a separate Reception DB for Marin).
- The property is in Mozambique, but a material share of guests are likely EU/UK residents, so **GDPR principles are commercially relevant even though the business itself is outside the EU** — this document does not constitute legal advice; a privacy policy, lawful-basis statement, and guest-facing data retention/deletion process should be confirmed or established with a lawyer before a sale, audit, or insurance underwriting decision.
- No dedicated data retention/expiry policy is implemented in code today (bookings and messages are kept indefinitely) — worth a deliberate decision either way rather than a default.

### 6.3 Payment / PCI scope
- Card payments (native direct-booking deposits) are processed entirely through **Stripe Checkout**, a Stripe-hosted page — the business's own servers and database never receive, transmit, or store card numbers.
- This keeps the business's PCI-DSS scope minimal (typically self-assessment level "SAQ A", the lightest tier) but should be confirmed with Stripe/a QSA if this matters for the transaction or policy in question.

### 6.4 Third-party dependency inventory (see §5.2 for detail)
Cloudflare (site hosting/CDN), Render (2 application services), Supabase (2 Postgres databases), Stripe (payments), OpenAI (voice AI), Beds24 (property management/availability — the one dependency that is specific to the hospitality industry and hardest to replace), an SMTP/Resend provider (email delivery), and Google Analytics 4 (attribution). All are mainstream vendors with published uptime track records and their own compliance certifications (e.g., Stripe is PCI-DSS Level 1 certified); none of them are exotic or high switching-cost beyond typical SaaS migration effort.

### 6.5 Business continuity / disaster recovery
- Database backup/retention depends on the Supabase plan tier selected for each of the two projects — this has not been independently verified as part of this document and should be checked directly in the Supabase dashboard before relying on it for a recovery plan.
- No automated cross-region failover or documented incident-response runbook exists today for the Render services or the website; if uptime SLAs matter for the transaction, this should be tested and documented separately (see §7).
- Deploys are git-based (GitHub `main` → Render; `wrangler` → Cloudflare Pages), so rolling back to a previous working version is straightforward via standard git history — there is no proprietary release process to reverse-engineer.

### 6.6 Key-person / continuity risk
- The platform has been built and is maintained by the owner working with Replit's AI coding agent rather than a dedicated engineering team. This is a legitimate low-overhead operating model, but it means institutional knowledge is concentrated with the owner rather than distributed across a team.
- This document, `replit.md`, and `threat_model.md` together are the mitigation for that risk — they are written specifically so a new developer (or a buyer's technical reviewer) can get oriented without needing to interview the original builder.

---

## 7. Risk Register & Recommendations

Concise, action-oriented list of what to verify or address before a sale, insurance underwriting decision, or major investment of trust in this platform. None of these are "the code is broken" issues — the application is functioning in production — they are diligence/verification gaps.

| # | Risk / gap | Why it matters | Suggested action |
|---|---|---|---|
| 1 | No independent security audit or penetration test has been performed | `threat_model.md` is a self-authored internal analysis, not third-party verification | Commission an external pentest/audit before a sale or if handling higher payment volumes |
| 2 | GDPR/privacy-policy formalities not confirmed | Guest PII is processed for an international guest base | Legal review of privacy policy, lawful basis, and data retention practice |
| 3 | Database backup/retention policy not independently verified | Data loss risk if the Supabase plan tier has minimal backup retention | Confirm current Supabase backup settings and retention window for both projects |
| 4 | No documented incident-response runbook or uptime SLA | Unclear recovery time if Render/Cloudflare/Supabase has an outage | Write a short runbook; consider uptime monitoring/alerting if not already in place |
| 5 | Key-person concentration (single owner-operator + AI agent workflow) | Continuity risk if the owner is unavailable | Keep this document and `replit.md` current; consider a handover checklist |
| 6 | `render.yaml` service name/type must exactly match the live Render service | A mismatch silently creates a duplicate service instead of updating the existing one | Verify before every Render Blueprint change (already flagged in `replit.md`) |
| 7 | 20-language content parity is manually maintained | New content silently renders blank (`undefined`) for languages not yet updated | Consider a lint/CI check that fails when a language object is missing a key |
| 8 | No formal PCI/compliance certification held by the business itself | Relies entirely on Stripe's certification for payment security | Confirm SAQ-A eligibility in writing with Stripe if required for insurance/underwriting |

---

## 8. Key File Map

| Concern | Path |
|---|---|
| Website content/data | `WebsiteProject/src/data/content.js` |
| Website i18n | `WebsiteProject/translations/`, `WebsiteProject/src/i18n*` |
| Native booking backend | `render-automailer/server/services/beds24.ts`, `stripe-booking.ts`, `server/config/booking-config.ts`, `server/routes/booking.ts` |
| Native booking frontend proxy | `WebsiteProject/functions/api/booking/*` |
| Email data model | `render-automailer/shared/schema.ts` |
| Email templates | `render-automailer/email_templates/base/`, `.../translations/` |
| Marin system prompt | `voice-reception/artifacts/api-server/src/routes/openai.ts` |
| Marin realtime relay / VAD | `voice-reception/artifacts/api-server/src/routes/openaiRealtimeRelay.ts` |
| Marin data model | `voice-reception/lib/db/src/schema/` |
| Marin widget embed | `voice-reception/artifacts/receptionist/public/widget-loader.js` |
| Render deploy config | `render.yaml` (repo root) |
| Cloudflare deploy config | `WebsiteProject/wrangler.toml`, `WebsiteProject/deploy.sh` |
| Threat model | `threat_model.md` (repo root) |
