---
name: ChatGPT integration layers
description: Three distinct integration layers for DEVOCEAN + ChatGPT; clean /talk URL pending; MCP/App path for future.
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
