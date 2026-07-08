---
name: Cloudflare Pages middleware SPA routing
description: Root _middleware.js intercepts before _redirects; SPA fallback must live in the middleware, not _redirects.
---

# Cloudflare Pages middleware SPA routing

## The rule
SPA fallback (404 → index.html) must be handled inside `_middleware.js`, not via `_redirects`.

**Why:** The root `functions/_middleware.js` intercepts every request before `_redirects` is ever consulted. `context.next()` only checks static assets — if no asset matches it returns 404, and the middleware passes that 404 through. The `_redirects` catch-all `/* /index.html 200` is never reached for requests that go through a Pages Function.

**How to apply:** In `onRequest`, after `await context.next()`, check `response.status === 404` + `Accept: text/html`, then fetch the root path `/` (never `/index.html`, see trap below) and serve that with status 200.

## Trap to avoid
Do NOT add explicit per-route rules like `/admin /index.html 200` to `_redirects`. Cloudflare Pages canonicalises `/index.html` → `/` and issues a redirect, sending the browser to the homepage instead of serving the SPA.

## Working pattern (in _middleware.js)
```javascript
let response = await context.next();
if (response.status === 404) {
  const accept = context.request.headers.get('accept') || '';
  if (accept.includes('text/html')) {
    const rootUrl = new URL('/', context.request.url);
    response = await context.env.ASSETS.fetch(new Request(rootUrl, context.request));
  } else {
    return response; // asset 404 — pass through
  }
}
```

## Trap #2: fetching "/index.html" (by any method) silently breaks every deep-linked SPA route
Cloudflare canonicalizes `/index.html` → `/` with a 308 **at the asset layer**, not
just the edge redirect engine — a bare `fetch('/index.html')` gets the 308, and
so does `context.env.ASSETS.fetch()` on `/index.html` (verified live: both
returned an empty-body 308 to `/`). That 308 has no `text/html` content-type,
so the middleware's content-type check returns it to the browser as-is. Since
real browsers auto-follow 308s on navigation, the visible symptom isn't a dead
page — it's every hard refresh / deep link (`/why-ponta`, `/book-direct`, etc.)
silently bouncing back to the homepage. Client-side `<Link>` navigation never
exercises this path, so it stays invisible until someone refreshes or opens a
direct link. **Fix: always fetch `/` for the SPA shell, never `/index.html`.**
`context.env.ASSETS.fetch()` is still preferable to a plain `fetch()` (talks
directly to the asset origin, one less network hop) but the root-vs-index.html
choice is what actually matters — swapping fetch mechanisms without also
switching to `/` does not fix this.
