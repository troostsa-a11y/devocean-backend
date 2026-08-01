---
name: CF Pages SPA route shadowing by stale static file
description: A pre-React standalone .html can survive indefinitely in a CF Pages deployment and shadow the correct SPA route — and a ?query smoke-check masks the bug instead of catching it.
---

## The problem

CF Pages deploys are additive when it comes to static assets: wrangler only uploads files that are new or changed. A file that existed in a previous deployment and is **absent** from the new build is NOT deleted from the CDN — it persists under its original clean URL.

A pre-React standalone page (e.g. `ponta-do-ouro-without-4x4.html`) that was removed from the repo long ago can therefore remain live at `/ponta-do-ouro-without-4x4` indefinitely, serving old markup (including `shared-nav.js` and breadcrumb HTML) regardless of how many new deploys are pushed.

**Why:**  
The middleware runs on every request, injects `window.__CF_COUNTRY__`, and overwrites the `<title>` from ROUTE_META, making the response look partially correct. The old body content (old markup, old nav, breadcrumb) comes through because `context.next()` returns the stale static file and the middleware never replaces the body.

## The smoke-check trap

Adding `?smoke=<timestamp>` to a URL as a cache-buster inadvertently bypasses CF Pages' clean-URL static-file matching. CF Pages' clean-URL feature (serving `foo.html` for `/foo`) only activates for an exact path match — a query string makes it a different request. The middleware's 404→SPA-shell fallback then kicks in, the SPA shell is served, and the build marker is found. The smoke check passes while the real clean URL still serves the stale file.

**How to apply:**  
Any smoke-check URL that tests a path which once had a standalone `.html` file MUST be tested at the **bare URL** (no query string). A `Cache-Control: no-cache` request header is sufficient for edge-cache busting on these paths.

## The fix

In `functions/_middleware.js`, for every path in `ROUTE_META` (and `/experiences/*`), fetch the SPA shell directly via `ASSETS.fetch` **before** calling `context.next()`:

```js
const isSpaRoute =
  ROUTE_META[pathname] != null ||
  /^\/experiences\/[a-z-]+$/.test(pathname);

let response = isSpaRoute
  ? await context.env.ASSETS.fetch(new Request(new URL('/', context.request.url), context.request))
  : await context.next();
```

`ASSETS.fetch('/')` bypasses static-file lookup entirely and always returns the SPA shell. A stale `.html` file at the same path can never win.

## Smoke-check rules for guide pages

- Test at the **bare URL** (no `?smoke=` or other query params).
- Assert `shared-nav.js` is **absent** as a secondary signal of the old format.
- Treat `shared-nav.js` presence as a **warning + retry**, not an immediate break — edge propagation can lag and the first node polled may not have the new Workers script yet.
- Allow the full retry budget (10 × 10 s = 100 s) before declaring failure.
