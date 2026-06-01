---
name: wrangler path-to-regexp version conflict
description: Why Cloudflare Pages Functions fail with "match is not a function" — and the fix.
---

## Rule
When `path-to-regexp` is declared as a direct project dependency at v0.x, wrangler@4's esbuild
bundler picks it up from the project's node_modules instead of wrangler's own copy (which needs v6+
for its `match` export). Every request throws `TypeError: match is not a function` → HTTP 1101.

**Why:** esbuild resolves imports starting from the importer's location and walks up node_modules.
The project's top-level `node_modules/path-to-regexp` at v0.1.13 satisfies the lookup before
wrangler's internal copy is considered. v0.1.x has no `match` export; wrangler@4's Pages template
requires it.

**How to apply:** Any time wrangler Pages Functions return 1101 for ALL requests, tail the
deployment logs (`wrangler pages deployment tail <id>`) — if you see `match is not a function`
in executeRequest, this is the cause.

**Fix applied (WebsiteProject):**
- Added a `match()` shim to `node_modules/path-to-regexp/index.js` (at the bottom) that
  implements the v6-compatible API using the existing `pathToRegexp(path, keys, options)` function.
- The shim: `pathToRegexp.match = function(pattern, opts) { ... }; module.exports.match = pathToRegexp.match;`
- Ideal long-term fix: remove `path-to-regexp` from project's package.json (Express bundles its
  own nested copy and doesn't need the top-level one).

## Also Fixed
- Middleware catch block: was calling `context.next()` a second time (double-next). When the asset
  binding (`env["ASSETS"]`) receives a non-GET method it throws, propagating through uncaught →
  1101. Fix: `return new Response('Service Error', { status: 500 })` in catch.
- Frontend ContactSection.jsx: `response.json()` was called unconditionally on non-OK responses.
  Cloudflare error pages are HTML → JSON parse throws → "Unexpected token '<', <!DOCTYPE".
  Fix: check `content-type: application/json` before parsing.
