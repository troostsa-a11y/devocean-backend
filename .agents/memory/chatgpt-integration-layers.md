---
name: ChatGPT integration layers
description: Three distinct integration layers for DEVOCEAN + ChatGPT; clean /talk URL pending; MCP/App path for future. Includes AI guest-journey glossary.
---

## Three layers — not interchangeable

| Layer | Where guest is | What it does | Status |
|---|---|---|---|
| On-site GPT-Realtime receptionist (`/?talk`) | Already on devoceanlodge.com | Live voice conversation, availability, booking enquiry | **Live** |
| Search discoverability (OAI-SearchBot, sitemap, structured data) | Inside ChatGPT search | ChatGPT finds, cites, links to the website | **Done (Jul 2026)** |
| ChatGPT App / MCP integration | Inside ChatGPT | ChatGPT uses DEVOCEAN tools directly (availability, booking) | Future |

## Pending: clean `/talk` URL

Current entry point is `/?talk` (query param). Recommendation: add `/talk` as a proper SPA route (or redirect `/talk → /?talk`) so the page has a clean, citable URL. Benefits: better ChatGPT citations, shareable in marketing, cleaner for guests.

**Why:** `/?talk` is technically fine but query params don't appear in ChatGPT search citations and are harder to share/remember.

**How to apply:** Add a wouter `<Route path="/talk">` that renders the homepage with the widget pre-opened, OR add `/talk → /?talk 302` in `_redirects`.

## Future: ChatGPT App / MCP integration

Requires a proper MCP server exposing defined tools (check_availability, get_room_info, start_booking, etc.). OpenAI Apps SDK path:
- MCP server with tool definitions (JSON schema per tool)
- Optional web component for UI inside ChatGPT
- Must pass OpenAI app quality + reliability requirements for public distribution

**Do not conflate with the on-site receptionist** — the MCP path is for guests who never leave ChatGPT. Only worth building when the on-site + discoverability layers are solid.

## AI guest-journey glossary (source: Lighthouse blog, 25 Jun 2026)

A traveler's path is now: ask an LLM-based chatbot (ChatGPT/Claude/Gemini) in **natural language** → the AI answers from what it knows about the property (risk: **hallucination** — confidently wrong amenities/hours/policies) → it recommends a property → routes the guest either to a **direct booking** (commission-free) or an **OTA** (15-20% commission) depending on what it's connected to.

Terms and how they map onto what already exists here:
- **GEO (Generative Engine Optimization)** — "SEO for the AI era": keep descriptions/amenities/policies/photos accurate and consistent everywhere the lodge is listed (own site, OTAs, Google), not just on devoceanlodge.com. Reduces hallucination risk. Partially built already — see `agent-readiness-cf-pages.md` (llms.txt, structured data, sitemap, robots.txt).
- **MCP (Model Context Protocol)** — the emerging standard letting an AI ask a property's system "what's available, at what price?" in real time, instead of guessing from a stale crawl. This is exactly the "ChatGPT App / MCP integration" future layer above — same concept, hotel-industry framing.
- **Direct booking** — a commission-free reservation straight to the property. `/book-direct` already is this. The commercial case for AI visibility only pays off if AI can route bookings *directly* here rather than to Booking.com/Expedia — reinforces why the MCP layer (not just search discoverability) is the layer with real revenue upside.
- **Attribution** — identifying which channel led to a booking. Already solved for web traffic via GA4 Measurement Protocol (`ga4-attribution.md`); AI-chat-originated bookings are not yet attributable since there's no MCP/booking-tool connection for ChatGPT to report through.
- **RevPAR (Revenue Per Available Room)** — standard hotel KPI (room revenue ÷ available rooms); not currently tracked anywhere in this codebase. Only relevant if/when comparing AI-driven booking value against OTA/direct-website bookings.

**Why this matters for DEVOCEAN:** the on-site receptionist + search discoverability layers already give ChatGPT accurate info to *describe* the lodge. The gap is the "connected" step — there's no MCP server exposing live availability/booking tools, so a ChatGPT recommendation today can't route a booking straight here; it falls back to sending the guest to the website (fine) or, if ChatGPT has an OTA integration for competitors, potentially loses the booking to a 15-20%-commission channel instead. Concrete argument for treating the MCP App layer as revenue-relevant, not just a nice-to-have.
