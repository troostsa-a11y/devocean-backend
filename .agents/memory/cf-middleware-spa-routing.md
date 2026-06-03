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
    response = await fetch(indexUrl.href); // status will be 200
  } else {
    return response; // asset 404 — pass through
  }
}
```
