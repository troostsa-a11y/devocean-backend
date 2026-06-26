---
name: Beds24 booking iframe removed (was must-not-be-sandboxed)
description: The embedded Beds24 iframe booking flow was removed in favor of the native /book-direct route; keeps the no-sandbox lesson in case an iframe is ever reintroduced
---

# Beds24 booking iframe — REMOVED (replaced by native `/book-direct`)

**Current decision:** The site no longer embeds Beds24 in an iframe. All "Book Now" CTAs go to the native `/book-direct` SPA route (Beds24 REST API + Stripe deposit). `thankyou.html` / `canceled.html` are intentionally kept because the Beds24 dashboard still externally redirects there.

**Why it was removed:** the iframe flow was superseded by the native direct-booking flow; maintaining both was redundant.

**Historical lesson (only if an embedded Beds24 iframe is ever reintroduced):** do NOT give it a `sandbox` attribute. Stripe's in-frame deposit / 3-D-Secure step needs storage-access, popups, and redirect freedoms; any sandbox (even one allowing top-navigation) blocked the post-payment return and landed the guest on a blank page instead of the confirmation.

**Legacy `/book/*` URLs:** redirected to `/book-direct` in `functions/_middleware.js` — it must live there, not in `_redirects`, because the root middleware intercepts every request before `_redirects` is consulted.
