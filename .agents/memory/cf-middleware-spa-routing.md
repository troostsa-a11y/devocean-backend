---
name: Cloudflare Pages middleware SPA routing
description: Root _middleware.js intercepts before _redirects; SPA fallback must live in the middleware, not _redirects.
---

# Cloudflare Pages middleware SPA routing

## The rule
SPA fallback (404 → index.html) must be handled inside `_middleware.js`, not via `_redirects`.

**Why:** The root `functions/_middleware.js` intercepts every request before `_redirects` is ever consulted. `context.next()` only checks static assets — if no asset matches it returns 404, and the middleware passes that 404 through. The `_redirects` catch-all `/* /index.html 200` is never reached for requests that go through a Pages Function.

**How to apply:** In `onRequest`, after `await context.next()`, check `response.status === 404` + `Accept: text/html`, then `fetch(new URL('/index.html', context.request.url).href)` and serve that with status 200.

## Trap to avoid
Do NOT add explicit per-route rules like `/admin /index.html 200` to `_redirects`. Cloudflare Pages canonicalises `/index.html` → `/` and issues a redirect, sending the browser to the homepage instead of serving the SPA.

## Working pattern (in _middleware.js)
```javascript
let response = await context.next();
if (response.status === 404) {
  const accept = context.request.headers.get('accept') || '';
  if (accept.includes('text/html')) {
    const indexUrl = new URL('/index.html', context.request.url);
    response = await context.env.ASSETS.fetch(new Request(indexUrl, context.request));
  } else {
    return response; // asset 404 — pass through
  }
}
```

## Trap #2: plain `fetch()` to /index.html silently breaks every deep-linked SPA route
A bare `fetch(indexUrl.href)` (not `context.env.ASSETS.fetch(...)`) re-enters Cloudflare's
public edge routing layer, which auto-canonicalizes `/index.html` → `/` with a 308.
That 308 has no `text/html` content-type, so the middleware's content-type check
returns it as-is — every hard refresh / direct nav to a client-side route (e.g.
`/book-direct`, `/why-ponta`) gets a bare redirect status instead of the SPA
shell, which renders as a dead/blank page (confirmed live via curl: real 404s
site-wide on any non-`/` route, while `/api/*` Functions kept working fine).
Client-side `<Link>` navigation never hits this path, so the bug is invisible
until someone hard-refreshes or opens a deep link directly — exactly how it
went unnoticed. Fix: use `context.env.ASSETS.fetch(new Request(url, request))`
to talk directly to the asset origin, bypassing the redirect layer entirely.
