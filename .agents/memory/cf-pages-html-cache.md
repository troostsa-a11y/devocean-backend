---
name: CF Pages HTML cache staleness
description: Why deploys looked "not live" — CF default caches HTML 4h at edge and browser
---
Rule: the Pages middleware must set `Cache-Control: no-cache, must-revalidate` on every HTML response it returns; hashed /assets/* files carry the long-lived cache.

**Why:** CF Pages defaults HTML to `public, max-age=14400`. After a deploy, browsers AND each regional CF edge can keep serving the old SPA shell (pointing at old bundles, which still exist in Pages storage) for up to 4 hours — this looked exactly like a "deploy didn't ship" / stale-asset bug, but prod assets were byte-identical to the local build.

**How to apply:** if prod "shows old UI" after a deploy, first curl the referenced /assets/* files and md5-compare against local dist before suspecting code or hash collisions; if identical, it's HTML cache — purge Everything in the CF dashboard for instant relief. Also note: the middleware SPA fallback only triggers when the request has `Accept: text/html`, so bare `curl` shows 404 on clean routes even when browsers get 200.
