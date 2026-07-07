---
name: Agent-readiness stack for CF Pages (devoceanlodge.com)
description: What was implemented for isitagentready.com and the score ceiling — patterns reusable on any CF Pages site.
---

## Rule
For a CF Pages static site with no auth server, the achievable isitagentready.com ceiling is ~71 (Level 4). All purely config/content checks can be done for free; the remaining gap is auth/MCP infrastructure.

## What was implemented

| Check | Mechanism | File |
|---|---|---|
| Discoverability 4/4 | robots.txt, sitemap, RFC 8288 Link header, DNS-AID HTTPS record | `public/_headers` (`/*` Link), `public/robots.txt`, DNS |
| Bot Access Control 2/2 | Already passing (robots.txt UA blocks) | `public/robots.txt` |
| Content Signals 1/1 | `Content-Signal` HTTP header on all pages | `public/_headers` `/*` block |
| API Catalog | `/.well-known/api-catalog` (RFC 9727 linkset+json) | `public/.well-known/api-catalog` |
| Agent Skills | `/.well-known/agent-skills/index.json` + `.md` files | `public/.well-known/agent-skills/` |
| Markdown Negotiation (Content 1/1) | CF middleware intercepts `Accept: text/markdown`, returns `llms.txt` with `Content-Type: text/markdown` + `X-Markdown-Tokens` | `functions/_middleware.js` |
| WebMCP | `navigator.modelContext.provideContext()` in App.jsx, guarded with existence check | `src/App.jsx` |

## Pattern: Markdown Negotiation (free, no Cloudflare paid plan needed)
In `functions/_middleware.js`, before `context.next()`:
1. Check `Accept` header for `text/markdown`
2. Exclude asset paths (regex on extension)
3. Fetch `/llms.txt`, return with `Content-Type: text/markdown; charset=utf-8` + `X-Markdown-Tokens: ceil(body.length/4)`

## Ceiling
The 4 remaining API/MCP checks (OAuth/OIDC, Protected Resource metadata, Auth.md, MCP Server Card) all require a running auth or MCP server. Skip unless adding authenticated API access.

## Commerce (x402, MPP, UCP, ACP) — all OPTIONAL, 0/0 score impact
Not applicable for a hospitality lodge. All four protocols are for machine-to-machine micropayments. Skip.

**Why:** Saves re-evaluating these on every future isitagentready.com scan.
