# Agentic Booking Roadmap

Goal: enable AI agents (Marin, external travel-agent platforms, future ChatGPT/Claude plugins) to complete a confirmed, paid booking on a guest's behalf — without the guest touching a form.

## Current state

| Capability | Status |
|---|---|
| Availability lookup (Beds24 read) | Live — Marin tool `check_availability` |
| Pricing (Beds24 read) | Live — surfaced via `/api/availability` |
| Enquiry capture + owner notification | Live — Marin tool `save_booking_enquiry` |
| Confirmed booking creation (Beds24 write) | `/book-direct` flow only — not exposed to Marin |
| Payment | Stripe Checkout (redirect-based, browser only) |
| MCP endpoint | Not yet |
| OAuth/OIDC | Not yet |

---

## Phase 1 — Marin confirms bookings (no OAuth needed)

**Beds24 write tool for Marin**

The API key already used by the Receptionist service almost certainly has write permission (the `/book-direct` checkout calls Beds24's booking creation endpoint using the same token). The booking creation logic lives in `voice-reception/artifacts/api-server/src/beds24/`.

What to build:
- New Marin tool `create_booking` that wraps the existing Beds24 POST call.
- Marin already collects the required inputs during conversation: guest name, email, check-in/out dates, room type, adult/child counts.
- Tool returns a Beds24 booking reference and triggers the SMTP notification (same as `save_booking_enquiry`).

Effort: small — the Beds24 client and SMTP notification code already exist; this is mostly a new tool definition + wiring.

**Stripe Payment Link**

After Beds24 confirms the booking, Marin generates a Stripe Payment Link server-side (one API call: `stripe.paymentLinks.create()`), pre-filled with the deposit amount and booking reference. Marin reads the URL back to the guest or sends it by email. Guest pays in one tap on their phone — no redirect flow, no browser session required on Marin's side.

Stripe is already integrated; Payment Links require no new Stripe setup.

Effort: small — one new server-side helper, one new Marin response pattern.

---

## Phase 2 — External agents can call your tools (MCP, API-key gated)

**MCP server endpoint**

Add a `/mcp` route to the existing Express API server (`voice-reception/artifacts/api-server/`). Expose the tool catalog over HTTP (Server-Sent Events or streamable HTTP, per MCP spec). Initial tools to expose:

- `check_availability(checkIn, checkOut, adults, children)`
- `get_pricing(roomType, checkIn, checkOut)`
- `create_booking(guestName, email, phone, roomType, checkIn, checkOut, adults, children)`
- `generate_payment_link(bookingRef, amount, currency)`

Gate the endpoint with a static API key (`MCP_API_KEY` env var) — good enough for B2B connections (travel platforms, agent frameworks) and avoids building a full OAuth server prematurely.

Publish `/mcp` in `llms.txt` and in a `.well-known/mcp.json` discovery file so agent frameworks can find it.

Effort: medium — MCP protocol handling + tool schema definitions. No new business logic beyond Phase 1.

---

## Phase 3 — Authenticated agent-on-behalf-of-guest flows (OAuth/OIDC)

Required when: a consumer-facing AI agent (ChatGPT, Claude, a travel super-app) needs to act as a specific identified guest with their explicit consent.

What to build:
- An OIDC authorization server (or delegate to Supabase Auth / Auth0 as the issuer).
- Authorization code flow with consent screen: "Allow [Agent] to book on your behalf at DEVOCEAN Lodge."
- Guest identity bound to the Stripe customer and Beds24 guest profile.
- Scoped access tokens: `booking:read`, `booking:write`, `payment:initiate`.
- Publish `.well-known/openid-configuration`.

This phase is triggered by a concrete partner request, not built speculatively.

---

## Recommended sequence

```
Phase 1a  Beds24 write tool for Marin          ~1–2 days
Phase 1b  Stripe Payment Link in Marin         ~1 day
Phase 2   MCP endpoint (API-key gated)         ~3–5 days
Phase 3   OAuth/OIDC (full identity layer)     when a partner asks for it
```

Phase 1 alone gets Marin to full end-to-end booking. Phase 2 opens the same capability to any MCP-compatible agent framework. Phase 3 is the final step for consumer-grade delegated authority.

---

## Key files

| File | Role |
|---|---|
| `voice-reception/artifacts/api-server/src/beds24/tool.ts` | Existing Beds24 tools (read + enquiry) |
| `voice-reception/artifacts/api-server/src/beds24/api.ts` | Beds24 HTTP client |
| `voice-reception/artifacts/api-server/src/routes/openai.ts` | System prompt + tool definitions |
| `voice-reception/artifacts/api-server/src/routes/openaiRealtimeRelay.ts` | WebSocket relay, tool dispatch |
| `WebsiteProject/functions/api/` | CF Functions handling `/book-direct` checkout |
| `WebsiteProject/public/llms.txt` | Add `/mcp` endpoint here when Phase 2 ships |
