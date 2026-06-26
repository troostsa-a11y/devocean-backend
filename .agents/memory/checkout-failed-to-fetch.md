---
name: Checkout "Failed to fetch" = upstream timeout, never a backend error
description: How to read "Failed to fetch" on the /book-direct Pay button, and why every external call in the checkout path must be time-bounded
---

# "Failed to fetch" on the Pay button means a timeout, not a Stripe/backend error

In the native booking flow the browser does `fetch('/api/booking/checkout')` →
Cloudflare Pages Function → Render Express `/checkout` → Beds24 quote → Stripe
`checkout.sessions.create`. The Render handler **catches every error and returns
JSON** (the UI renders it as `data.error` text, e.g. "Could not start checkout").

**Therefore a browser `TypeError: Failed to fetch` is NOT a Stripe/backend
rejection** — those come back as JSON. It is a network-level timeout / dropped
connection: the handler is stuck inside an `await` that never throws until
Cloudflare's ~100s edge limit kills the request.

**Why:** a real incident — after switching the Render Stripe secret to a live
key, the Pay button hung a long time then showed "Failed to fetch", with ZERO
Render logs. The Stripe Node SDK's default request timeout is **80s**, which
exceeds Cloudflare's edge limit, so a stalled Stripe (or Beds24) call surfaces
as a silent hang instead of a clean error. "No logs" was not decisive on its own
because the route only logged inside `catch`.

**How to apply / rules:**
- Every external call in the checkout path must be bounded well under ~100s:
  Stripe client is constructed with `timeout` + `maxNetworkRetries`; Beds24
  fetches go through a `fetchWithTimeout` (AbortController). Keep the sum of
  worst-case waits under Cloudflare's edge limit.
- Diagnose with the `[BOOKING] checkout:` breadcrumbs (`start` / `quote ok` /
  `row created` / `stripe session ok`). The last one printed before the stall
  localizes the culprit: no `start` = CF→Render/proxy; `start` only =
  Beds24/quote; `row created` only = Stripe session create.
- The Stripe client is a module-level singleton built once from the first-seen
  `STRIPE_SECRET_KEY`. **Always restart/redeploy Render after changing the
  secret** or the old key (and old client options) persist for the process life.
