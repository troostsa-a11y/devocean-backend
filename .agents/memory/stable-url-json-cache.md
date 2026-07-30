---
name: Stable-URL runtime JSON caching
description: Cache-busting pattern for runtime-fetched JSON with stable URLs on CF Pages
---
Rule: any file fetched at runtime from a stable URL (e.g. /translations/*.json) must carry a build token (`?v=__BUILD_ID__` injected via Vite `define`, git short hash) AND ship `Cache-Control: max-age=0, must-revalidate` in `_headers`.

**Why:** after a deploy, browsers kept week-old translation JSON — users saw old menu text until they cycled languages. Header changes alone don't evict copies already cached under the previous long TTL; only a changed URL does.

**How to apply:** for SPA fetches, append the token in code. For static .html pages loading plain scripts (accommodation-detail-i18n.js etc.), only the header fix applies — old copies age out over the previous TTL. Note: main UI strings load via hashed dynamic imports (src/i18n/langs/*.js) and self-bust; only public/ JSON fetches are at risk.
