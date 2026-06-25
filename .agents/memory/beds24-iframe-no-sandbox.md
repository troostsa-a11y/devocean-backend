---
name: Beds24 booking iframe must not be sandboxed
description: Why #beds24frame in WebsiteProject/public/book/*.html has no sandbox attribute, and what breaks if you add one back
---

# Beds24 booking iframe — no `sandbox` attribute

The `#beds24frame` iframe in `WebsiteProject/public/book/*.html` (and `booking-simple.html`) loads `beds24.com/booking2.php` with **no `sandbox` attribute** (full iframe permissions).

**Rule:** Do NOT add a `sandbox` attribute to `#beds24frame`.

**Why:** Bookings take a 50% deposit via **Stripe inside the Beds24 iframe**. Stripe's payment / 3-D-Secure step needs storage-access, popups, and redirect freedoms. A `sandbox` — *even one that includes `allow-top-navigation` plus popups/modals/forms/scripts/same-origin* — blocked the post-payment return, so after paying the guest landed on a **blank/error page instead of the `/thankyou` confirmation**. The older `booking-simple.html` (which never had a sandbox) kept working, which is what isolated the cause. Removing the sandbox from all `book/*.html` fixed it.

**How to apply:** beds24.com is a trusted, intentionally-embedded provider, so dropping the iframe sandbox (defense-in-depth only, not a critical control per threat_model.md) is acceptable. With no sandbox, top-navigation still works by default, so the frame-busting thankyou/canceled pages and payment redirects all function.

**Confirmation flow (for debugging "confirmation page not showing"):** Beds24 redirects to `/thankyou.html?bookid=...` → Cloudflare Pages 308-redirects `.html` → clean URL (`/thankyou`) → serves the confirmation page. A blank page after booking is the iframe-sandbox blocking the redirect, NOT the 308 (the 308 → clean URL is normal CF behavior and resolves fine).
