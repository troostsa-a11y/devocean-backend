# DEVOCEAN Platform — Scope & Pricing to Replicate for a New Lodge

**Purpose:** An internal planning document answering "what would it take to stand up a working copy of this platform for a different, similarly small lodge, in its own separate Replit project — and what should we charge for that?" This is a go-to-market/pricing worksheet, distinct from `TECHNICAL_ASSET_DESCRIPTION.md` (which describes DEVOCEAN Lodge's own assets for a buyer/insurer/lender).

**As of:** July 2026.

---

## 1. Delivery Model Assumption

This is scoped as **one forked, single-tenant copy per client** — a separate Replit project, separate GitHub repo, separate Cloudflare Pages project, separate Render services, and separate Supabase database(s) — matching what you asked for ("a similar small scale lodge... in a separate Replit project"). It is **not** a multi-tenant SaaS product (one shared codebase serving many lodges from a config file). That's a real possibility worth considering later (see §7), but it's a materially larger upfront engineering investment and isn't what's scoped or priced below.

Under this per-client model, every new client means: a new codebase fork, new infrastructure, and hands-on customization work — closer to a "custom build using a proven template" than a plug-and-play SaaS signup.

---

## 2. What's Reusable As-Is vs. What's Lodge-Specific

| Reusable (the "template") | Must be redone per client (the "customization") |
|---|---|
| Overall architecture (website + automailer + optional AI receptionist) | All branding: name, logo, colors, photography |
| Native direct-booking engine (Beds24 quote → Stripe Checkout → webhook → confirmed booking) | Room types, rates, amenities, experience/activity content |
| Booking double-booking guard, deposit/balance logic | Beds24 property ID, room/rate ID mapping |
| Email scheduling engine (cron, lifecycle timing logic) | Every language's actual translated copy (framework is reusable, content is not) |
| i18n framework/plumbing (`i18next`, translation key structure) | The specific languages offered (a new client may only need 3-5, not 20) |
| Admin dashboard code (guest export, auth) | Client's own admin login credentials/API keys |
| Marin's real-time voice relay engineering (WebSocket relay, VAD tuning, session-loop guard) | Marin's system prompt: property facts, local activities, policies, name pronunciation |
| GA4 attribution pipeline logic | GA4 property ID, measurement/API secrets |
| Security patterns (signature-verified webhooks, server-side price recomputation, `requireAdminKey`) | All third-party accounts (see §4) — each client must own their own |

The practical takeaway: the **engineering is a template**, but the **content, branding, and account provisioning are 100% per-client work**. Translation content is the single biggest cost lever (see §3).

---

## 3. Scope of Work & Hour Estimates

### 3.1 Package A — "Core" (Website + Native Direct Booking + Automated Guest Emails)

No AI voice receptionist. Assumes 5 languages (English + 4 others — a realistic starting point for a small lodge, versus DEVOCEAN's full 20).

| Task | Hours (Est.) |
|---|---|
| Environment & infra setup (Replit fork, new GitHub repo, Cloudflare Pages project, Render service, Supabase database, DNS cutover) | 16 |
| Branding & content customization (copy, color palette, photography integration, room/experience data) | 40 |
| Translation content — 5 languages incl. English (~12h/language: website copy + email copy) | 60 |
| Beds24 + Stripe native booking integration, re-pointed to the new property, deposit/cancellation policy config | 30 |
| Automailer customization (5 guest lifecycle email types × 5 languages, IMAP parser verified against the client's actual Beds24 notification email format) | 40 |
| Admin dashboard rebrand + guest export verification | 10 |
| QA (full booking + email flow, test transactions), deployment, owner handoff/training | 20 |
| **Total** | **216 hours** |

At a $60/hr regional development rate (same benchmark used in `TECHNICAL_ASSET_DESCRIPTION.md` §8): **~$12,960 internal cost**.

### 3.2 Package B — "Full" (Core + Marin-style AI Voice Receptionist)

Everything in Package A, plus:

| Task | Hours (Est.) |
|---|---|
| Voice-receptionist service fork & infra (2nd Render service, 2nd Supabase database) | 10 |
| System prompt & knowledge base customization (property facts, policies, local activities/attractions, pronunciation guide for the property's name) | 30 |
| Tool re-verification against the new property (live availability, weather, currency conversion, booking-enquiry email routing) | 15 |
| Voice persona & widget branding (name, colors, embed styling on the new site) | 15 |
| End-to-end voice QA (test calls, VAD threshold tuning if needed for the new environment) | 15 |
| **Additional subtotal** | **85 hours** |

**Package B total: 301 hours** → **~$18,060 internal cost** at $60/hr.

### 3.3 Cost Sensitivity: Language Count

Translation content dominates cost growth. Each additional language beyond the initial 5 adds roughly **12 hours (~$720 at $60/hr)** for website + email copy. Going from 5 → 20 languages (DEVOCEAN's current scope) would add ~180 hours (~$10,800) — this is why starting a new client at 3-5 languages and offering more as a paid add-on later is the more capital-efficient path.

---

## 4. Third-Party Accounts Each Client Must Provision Themselves

For billing transparency and to avoid the agency being a single point of failure or liability for the client's money movement, the client should hold these accounts directly (the setup work above wires the credentials in, but the accounts and their ongoing bills belong to the client):

| Service | What it's for | Billing model |
|---|---|---|
| Beds24 | Property management system — source of truth for availability/pricing | Client's existing PMS subscription |
| Stripe | Payment processing for booking deposits | Per-transaction (~2.9% + $0.30), no monthly fee |
| Supabase | PostgreSQL database(s) — 1 for automailer, 1 more if Marin is included | Free tier often sufficient at low volume; paid tier if usage grows |
| Render | Hosts the automailer and (if included) the voice-receptionist service | Per-service monthly plan |
| Cloudflare Pages | Hosts the marketing website/booking frontend | Free tier typically sufficient for a small lodge's traffic |
| OpenAI (Package B only) | Powers Marin's real-time voice | Usage-based (per-minute of audio) — scales with call volume, worth monitoring/capping |
| Domain registrar | The client's own domain name | Annual registration fee |
| SMTP/IMAP mailbox | Sends/receives booking notification and guest emails | Often free via the client's existing email provider |
| Google Maps API (optional) | Powers the location map, if reused | Free tier typically sufficient at low request volume |
| Google Analytics 4 (optional) | Booking attribution | Free |

Exact current prices for each of these should be checked on the vendor's live pricing page rather than assumed — none are tracked as fixed figures in this document.

---

## 5. Recommended Client-Facing Fee

Internal hourly cost (§3) is the *floor*, not the price. A one-off custom build using a proven, working template — with a differentiated AI voice feature few small-lodge competitors have — reasonably commands a premium over raw cost-plus hourly billing, similar to how a boutique web agency prices a custom hospitality site.

| Package | Internal cost (@ $60/hr) | Recommended one-time client fee |
|---|---|---|
| A — Core (website + native booking + automated emails, 5 languages) | ~$12,960 | **$16,000 – $22,000** |
| B — Full (Core + AI voice receptionist) | ~$18,060 | **$24,000 – $32,000** |

Rationale for the markup: the client is not just buying hours, they're buying a *working, already-proven system* (real bookings, real payment flow, real guest emails already battle-tested on DEVOCEAN) rather than a from-scratch build — that de-risking is worth pricing above pure labor cost. The AI voice receptionist in particular is a genuine differentiator (§8.6 of the asset description makes the same point about DEVOCEAN itself) and justifies the larger jump between packages.

### Ongoing retainer (recommended, separate from the setup fee)
Because this is a forked, single-tenant deployment rather than a shared multi-tenant SaaS, each client's instance needs individual attention over time — dependency updates, API/model-name deprecations (this has already happened once to DEVOCEAN's own Marin instance — see `replit.md`'s note on the retired `gpt-4o-audio-preview` alias), content edits, and monitoring. A monthly support retainer of **$150 – $400/month** (scoped to "reasonable-effort bug fixes and minor content updates"; larger feature work billed separately) is the more sustainable way to fund that ongoing maintenance rather than bundling it into the one-time fee.

---

## 6. Risks & Caveats Specific to Replication

- **Not true multi-tenant SaaS.** Every client is a separate codebase fork with separate infrastructure. This model doesn't scale the way a subscription SaaS product would — margin comes from packaging/reuse of the engineering, not from marginal-cost-per-customer economics. See §7 if the goal is to eventually build a real scalable product.
- **Beds24 notification email format varies by account/property configuration.** The IMAP parser must be verified against the *actual* notification emails the new client's Beds24 account sends — don't assume it works unmodified.
- **OpenAI Realtime API costs scale with call volume** for Package B — advise clients to monitor usage, and consider recommending a monthly spend cap if their call volume is unpredictable.
- **Full rebrand required for the AI persona.** "Marin," the DEVOCEAN pronunciation guide, and the property-specific system prompt all need a genuine rewrite per client, not a find-and-replace — a shallow rebrand risks Marin giving wrong or DEVOCEAN-specific answers.
- **Legal/liability framing.** Since Marin gives guests information (availability, pricing, policies) verbally, it's worth the client's own terms of service clarifying that verbal AI responses are informational and that written booking confirmations govern — this protects both the client and the agency delivering the platform.

---

## 7. Future Option: True Multi-Tenant Product

If the goal shifts from "sell a handful of custom builds" to "build a repeatable hospitality-tech product," the bigger investment is refactoring toward one shared codebase serving many lodges via per-tenant configuration (property ID, branding, language set, content all data-driven rather than hardcoded) instead of a fork-per-client model. That is a significantly larger one-time engineering cost than anything scoped above, but it changes the economics from "custom build fee per client" to "low marginal cost per additional customer" — worth a dedicated scoping exercise if there's real demand from more than a handful of lodges. Not priced here since it's a different kind of project entirely.
