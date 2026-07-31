---
name: Clean-URL lang policy
description: Site-wide rule for how ?lang= is handled on devoceanlodge.com
---
Rule: `?lang=xx` is an **entry-only** parameter. On arrival, every surface (SPA useLocale, shared-nav static pages, legal pages, thankyou/canceled Stripe returns) applies the language, persists it to `site.lang` (+ `site.lang_source`), then strips the param via `history.replaceState`. All internal links are bare — no `?lang=` or `?currency=` anywhere. Canonical is always the bare URL.

**Why:** duplicate URLs for the same content created multiple cache keys (contributed to the July 30, 2026 stale-cache/indexing saga) and canonical confusion.

**How to apply:** any new page or link helper must NOT append lang/currency to internal hrefs; language flows through localStorage. Entry redirects (App.jsx locale paths, back.html booking-engine returns, hreflang alternates, GA4/ads deep links) may still target `/?lang=` — the landing page cleans it. thankyou/canceled pages map their short Stripe lang code to a full `site.lang` code so bare legal links stay localized.
