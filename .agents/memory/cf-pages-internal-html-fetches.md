---
name: Cloudflare Pages internal HTML fetches
description: Avoiding clean-URL redirect loops when middleware renders standalone HTML pages through ASSETS.fetch
---

## Rule

Do not use a root or nested `.html` URL as the internal source for a clean route rendered by Pages middleware. Cloudflare Pages can canonicalize that asset request back to the extensionless URL, including when the request comes through `ASSETS.fetch()`. Use a neutral-extension internal copy and explicitly set its response content type to HTML after middleware processing.

**Why:** Fetching `/safari.html` while handling `/safari` returned a 308 to `/safari`, which re-entered the middleware and produced `ERR_TOO_MANY_REDIRECTS`. Adding a query string or nesting the `.html` file did not avoid the canonicalization.

**How to apply:** Map each public clean route to a non-`.html` build asset, fail a missing internal asset before the generic SPA fallback, and cover the route with a local Pages emulator test plus a legacy-query redirect test.