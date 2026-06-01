---
name: Wrangler version & Node compatibility
description: History of the wrangler/Node pairing for WebsiteProject Cloudflare Pages deploys. Environment now runs Node 22 + wrangler@4.
---

# Wrangler Version & Node Compatibility

## Current state (resolved)
Environment runs **Node 22.22.0**. Wrangler@4.95.0 is installed locally in
`WebsiteProject/node_modules/`. `deploy.sh` uses bare `npx wrangler pages deploy ./dist`
— no version pin needed.

## History / why this matters
Originally the environment ran Node 20. Wrangler@4 requires Node >=22 and silently
produced a malformed Pages Functions bundle on Node 20, causing Cloudflare Error 1101
on every request. The Error 1101 appeared even on `.pages.dev` preview URLs and the
Cloudflare dashboard showed the deployment as ✓ successful — no useful error shown.

**The fix at the time:** pinned `deploy.sh` to `npx wrangler@3`.
**Permanent fix:** upgraded environment to Node 22, installed wrangler@4 locally,
dropped the version pin from `deploy.sh`.

## Rule for future upgrades
If wrangler is ever upgraded again, confirm `node --version` is within the new
engine range before deploying. A wrangler engine mismatch always manifests as
1101 on all Pages Function routes, not a build error.

## Deploy script location
`WebsiteProject/deploy.sh`
