---
name: CF Pages HTML cache staleness
description: Why deploys looked "not live" — CF default caches HTML 4h at edge and browser
---
Rule: the Pages middleware must set `Cache-Control: no-cache, must-revalidate` on every HTML response it returns; hashed /assets/* files carry the long-lived cache.

**Why:** CF Pages defaults HTML to `public, max-age=14400`. After a deploy, browsers AND each regional CF edge can keep serving the old SPA shell (pointing at old bundles, which still exist in Pages storage) for up to 4 hours — this looked exactly like a "deploy didn't ship" / stale-asset bug, but prod assets were byte-identical to the local build.

**ACTUAL root cause (July 2026, after deeper debugging):** Cloudflare's "Google tag gateway" zone feature injected a `/nik2/` script that registered a service worker (`/nik2/_/service_worker`) in every visitor's browser. That SW intercepted navigations and served STALE page content — surviving Purge Everything, browser cache clears, and PC restarts (only incognito's first page load bypassed it; the SW re-registered immediately, breaking the next navigation). Symptom signature: first page load fresh, subsequent navigations stale; curl gets new content while the browser gets old. Fix: disable Google tag gateway in the zone (GTM already loads via the site's own delayed loader); the SW URL then 404s and visitors' browsers auto-unregister it. The "Cache everything" zone rule below was a contributing second layer, not the main culprit.

**Secondary layer found first:** the devoceanlodge.com ZONE had a "Cache everything" Cache Rule matching ALL incoming requests — it overrode the middleware's no-cache header (rewriting it to max-age=14400) and cached HTML at every regional edge. pages.dev (no zone rules) served no-cache correctly; the custom domain didn't. Diagnostic: compare `cache-control` between pages.dev and the custom domain — if they differ, a zone Cache/Page Rule is rewriting headers. Purge Everything only helps until the rule re-caches; the rule itself must be deleted or scoped to static paths only.

**How to apply:** if prod "shows old UI" after a deploy, first curl the referenced /assets/* files and md5-compare against local dist before suspecting code or hash collisions; if identical, it's HTML cache — purge Everything in the CF dashboard for instant relief. Also note: the middleware SPA fallback only triggers when the request has `Accept: text/html`, so bare `curl` shows 404 on clean routes even when browsers get 200.
