---
name: Stale prod HTML/JS after deploy — layer checklist
description: Ordered causes when devoceanlodge.com shows old UI after a deploy
---
When prod shows a pre-deploy UI, check in this order (all bit us on July 30, 2026):
1. **Cloudflare "Google tag gateway"** — injects a `/nik2/` service worker that serves stale full-page HTML. Disable in CF dashboard; verify the SW URL 404s.
2. **CF "Cache everything" zone rule** — overrides middleware headers; HTML must be `DYNAMIC`/`no-cache` via curl.
3. **Long-cached runtime assets fetched by URL** — e.g. `/js/shared-nav.js` (static room pages' menu) had `max-age=604800` + SWR. Fix = `?v=<date>` on the script ref AND `max-age=0, must-revalidate` in `_headers`; header changes alone can't bust already-cached copies.
4. **User's local browser disk cache** of per-URL `?lang=xx` HTML — if curl shows fresh for all languages, it's client-side; clear "Cached images and files" once.

**Why:** each layer masks the next; hours were lost fixing code while an upstream layer served stale content.
**How to apply:** always curl (with `Accept: text/html`) before assuming a code/deploy problem. User runs all deploys themselves (`bash deploy.sh`).
