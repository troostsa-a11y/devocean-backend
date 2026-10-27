---
name: Stale prod HTML/JS after deploy — layer checklist
description: Ordered causes when devoceanlodge.com shows old UI after a deploy
---
Before diagnosing cache staleness, distinguish HTML routes from intentional redirects and retired URLs.

**Why:** A healthy redirect has no HTML build marker. Blindly following redirects can also produce a false pass if an incorrect homepage destination happens to serve the new build.

**How to apply:** Verify the expected status, same-origin destination and required state before checking the destination's HTML marker. Keep guide checks on bare URLs; cache-busting queries can hide stale static-file routing. Do not rebuild or purge caches just because a redirect's own response has no marker.

When prod actually shows a pre-deploy UI, check in this order:
1. **Cloudflare "Google tag gateway"** — injects a `/nik2/` service worker that serves stale full-page HTML. Disable in CF dashboard; verify the SW URL 404s.
2. **CF "Cache everything" zone rule** — overrides middleware headers; HTML must be `DYNAMIC`/`no-cache` via curl.
3. **Long-cached runtime assets fetched by URL** — e.g. `/js/shared-nav.js` (static room pages' menu) had `max-age=604800` + SWR. Fix = `?v=<date>` on the script ref AND `max-age=0, must-revalidate` in `_headers`; header changes alone can't bust already-cached copies.
4. **Cache Reserve** — persistent R2-backed second-tier cache re-seeds the edge after every "Purge Everything", making purges look ineffective. Fix = "Delete Cache Reserve Data" (~24h) + Development Mode for instant bypass. Also poisoned Googlebot-only copies (X-Robots-Tag noindex from bot features) survived here per-URL — bare URLs failed GSC live test while ?query variants passed.
5. **User's local browser disk cache** of per-URL `?lang=xx` HTML — if curl shows fresh for all languages, it's client-side; clear "Cached images and files" once.
6. **Concurrent build vs deploy marker** — a second build can rewrite the SPA shell after marker injection, making a successful upload look stale. Inject and assert the marker as the final pre-upload step; do not run verification builds during deploy.

**Why:** each layer masks the next; hours were lost fixing code while an upstream layer served stale content.
**How to apply:** always curl (with `Accept: text/html`) before assuming a code/deploy problem. User runs all deploys themselves (`bash deploy.sh`).
