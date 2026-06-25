---
name: Dev server CF country parity
description: WebsiteProject dev server must mirror the CF Pages country injection, but only for SPA navigations
---

The React app derives currency/language from `window.__CF_COUNTRY__` (see useLocale `getCountryCode`). In production that global is injected by `WebsiteProject/functions/_middleware.js` from `context.request.cf.country`. The dev server (`WebsiteProject/server.js`, Vite `middlewareMode` + `appType:'spa'`) does NOT get that for free, so without a dev shim the preview always falls back to USD / default lang.

**Rule:** to make geolocation-dependent UI testable in preview, add an Express middleware BEFORE `vite.middlewares` that injects `window.__CF_COUNTRY__` from the `cf-ipcountry` request header. It MUST only handle extensionless GET `text/html` navigations — guard with `if (/\.[a-zA-Z0-9]+$/.test(req.path)) return next();`.

**Why:** the project serves real static HTML pages (`/book/EN.html`, `/thankyou.html`, `/canceled.html`, `/safari.html`, ...). A broad "intercept every text/html GET" middleware serves `index.html` for those too, silently hijacking the Beds24 iframe + confirmation flows in dev.

**How to apply:** read `index.html`, run `vite.transformIndexHtml(req.originalUrl, html)`, then inject the script into `<head>`. Validate the header strictly (`/^[A-Za-z]{2}$/ ? upper : ''`) — in dev the header is client-controllable, so a permissive parse is an HTML/script-injection vector. Replit forwards `cf-ipcountry` in the preview edge (server.js already relies on it for the booking proxy); it's a harmless no-op (empty → USD) when absent.
