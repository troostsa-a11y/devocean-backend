---
name: Cloudflare Security Analytics via GraphQL API
description: How to query real per-event Cloudflare security/firewall data for this Free-plan zone, and how to interpret action types when judging whether traffic is a targeted attack vs generic bot noise
---

## Access
- A scoped Cloudflare API token exists as the `CLOUDFLARE_API_TOKEN` secret (Zone:Read + Zone Analytics:Read, resource-scoped to `devoceanlodge.com` only — no DNS/WAF-edit/R2/rate-limit access).
- It's available in `bash`/shell env directly. It is NOT exposed to the `code_execution` JS sandbox's `process.env` (that sandbox has its own env; use `bash` + `curl` for Cloudflare API calls instead).

## Free-plan GraphQL Analytics API constraints
**Why:** `devoceanlodge.com` is on Cloudflare's Free plan. The grouped/aggregated dataset `firewallEventsAdaptiveGroups` requires Pro+ and returns an opaque `"zone does not have access to the path"` authz error on Free — this is a plan-tier limit, not a token-permission bug.
**How to apply:** Use the ungrouped `firewallEventsAdaptive` dataset instead (available on Free) and aggregate client-side (python/collections.Counter over IP, action, source, country, ASN, path, UA). This dataset also caps each query's `datetime_geq`→`datetime_leq` span at **1 day** — loop day-by-day and merge results for a longer window.

## Interpreting `action` values (critical for "are we being attacked" questions)
**Why:** The Security Analytics dashboard's country/action tallies conflate very different severities into one number, which makes raw counts misleading.
- `link_maze_injected` (source `linkMaze`) — Cloudflare's AI-crawler honeypot (AI Labyrinth). It silently appends hidden decoy links to the page. **Zero visible impact on real visitors** — no challenge, no block, page renders normally. This is usually the dominant action for any given country and should not be read as "friction."
- `managed_challenge` (source `botFight`) — an actual interactive challenge shown to the visitor. This is the real friction metric to check when worried about false positives against real users/markets.
- `block` — hard block, always worth auditing individually since it fully denies the request.
**How to apply:** When judging "is market X being wrongly blocked," filter/count `managed_challenge` and `block` specifically — ignore `link_maze_injected` volume, it's noise-free of user impact.

## Distinguishing targeted attack vs generic scanning/real users
**Why:** distinct-IP fan-out vs IP concentration is the clearest signal.
**How to apply:** Group events by `clientIP`. Real organic traffic from a country (e.g. South Africa) shows a high distinct-IP count spread across residential/mobile ISPs (MTN SA, Vodacom, Telkom SA, Cell C, Rain, Afrihost, etc. — verify via `clientASNDescription`). A targeted attack or scanner shows heavy concentration on a handful of cloud-hosting ASNs (Azure `4.x`/`20.x`, GCP `2600:1900:...`) often from geographically unrelated countries (JP/BR/SG/US topped this zone's 24h volume, not any single "enemy" country). Confirmed one Facebook in-app-browser UA pattern (`FB_IAB`/`FBAN`) is the specific trigger behind the rare real `managed_challenge` hits from South Africa — a known industry-wide Bot Fight Mode false-positive source, not something specific to this site.
