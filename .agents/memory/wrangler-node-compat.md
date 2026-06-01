---
name: Wrangler version & Node compatibility
description: Wrangler@4 requires Node >=22 and silently produces broken Cloudflare Pages Functions bundles on Node 20, causing Error 1101 on every request.
---

# Wrangler Version & Node Compatibility

## The Rule
Always use `wrangler@3` (via `npx wrangler@3`) in `WebsiteProject/deploy.sh` when the environment runs Node 20. Wrangler@4 explicitly requires Node >=22, and running it on Node 20 produces a malformed Functions bundle — Cloudflare returns Error 1101 on all requests with no useful stack trace.

**Why:** wrangler@4 prints an engine warning on Node 20 but continues; the compiled Worker passes `"Compiled Worker successfully"` yet the bundle is broken at runtime. No middleware try/catch can recover from a bundle init failure — 1101 appears before any handler runs.

**How to apply:** `deploy.sh` is the only deployment path — never run bare `npx wrangler pages deploy`. The script is pinned to `npx wrangler@3 pages deploy ./dist`. If Node is ever upgraded to >=22, update to `wrangler@4` at that time.

## Deploy script location
`WebsiteProject/deploy.sh`

## Symptoms of a broken bundle
- Cloudflare Error 1101 on every URL including the `.pages.dev` preview
- Wrangler output shows "Compiled Worker successfully" and "Deployment complete!" — no errors
- Cloudflare dashboard shows the deployment as ✓ (successful)
- No Worker Routes configured at the zone level (not a routing issue)
