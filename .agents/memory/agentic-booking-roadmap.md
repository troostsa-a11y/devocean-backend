---
name: Agentic booking roadmap
description: Phased plan for AI agents to complete confirmed paid bookings. Current state, 4 phases, effort estimates, and key files.
---

## The goal
AI agents (Marin, external travel platforms, ChatGPT/Claude) complete a confirmed paid booking on a guest's behalf without the guest touching a form.

## Current state (as of July 2026)
- Availability + pricing: live via Marin `check_availability` tool
- Enquiry capture + owner notification: live via Marin `save_booking_enquiry`
- Confirmed booking creation: `/book-direct` only — NOT exposed to Marin
- Payment: Stripe Checkout (redirect-based, browser only)
- MCP endpoint: not yet
- OAuth/OIDC: not yet

## Phase 1 — Marin confirms bookings (no OAuth needed, ~2–3 days)
**Beds24 write tool**: The API token in use on the Receptionist service almost certainly already has write permission (same token the /book-direct checkout uses). The Beds24 HTTP client is in `voice-reception/artifacts/api-server/src/beds24/api.ts`. Add a `create_booking` tool definition alongside the existing tools in `tool.ts` and wire it into the tool dispatch in `openaiRealtimeRelay.ts`. Marin already collects all required inputs (name, email, dates, room, guests).

**Stripe Payment Link**: After Beds24 confirms, call `stripe.paymentLinks.create()` server-side with deposit amount + booking ref. Marin reads the URL to the guest or emails it. Guest pays in one tap. No new Stripe setup needed.

## Phase 2 — External agents (MCP, API-key gated, ~3–5 days)
Add `/mcp` route to the Express API server. Expose `check_availability`, `get_pricing`, `create_booking`, `generate_payment_link` as MCP tools. Gate with `MCP_API_KEY` env var. Add `/mcp` to `llms.txt` and a `.well-known/mcp.json`.

## Phase 3 — OAuth/OIDC (build when a partner asks)
OIDC authorization server (or Supabase Auth as issuer), authorization_code flow with consent screen, scoped tokens (`booking:read`, `booking:write`, `payment:initiate`), publish `.well-known/openid-configuration`. Do not build speculatively.

## Key files
- `voice-reception/artifacts/api-server/src/beds24/tool.ts` — existing tools
- `voice-reception/artifacts/api-server/src/beds24/api.ts` — Beds24 HTTP client
- `voice-reception/artifacts/api-server/src/routes/openai.ts` — system prompt + tool defs
- `voice-reception/artifacts/api-server/src/routes/openaiRealtimeRelay.ts` — tool dispatch
- `docs/agentic-booking-roadmap.md` — full written roadmap

**Why:** User confirmed this is the strategic direction; Phase 1 is intentionally close to current state — Beds24 key + Stripe already in place, just needs wiring.
