---
name: Clean-URL lang policy
description: Locale-path generation and the confirmed decision to retain bounded inbound language-query compatibility
---
Rule: Generate only current locale-path website links, not `?lang=xx`. Retain a bounded same-origin adapter for incoming old language links; do not restore independent query readers throughout the frontend.

**Why:** After the usage check found recent legacy requests, including requests that could not be classified as crawlers, the user explicitly chose to keep safe inbound support. A current-app migration alone is not evidence that incoming links have stopped being used.

**How to apply:** Limit the adapter to registered public documents and supported language codes, honour an existing locale path, and preserve booking fields, currency and fragments. Never use query parameters as redirect destinations. Reconsider removal only with evidence of no remaining incoming use or explicit user approval.

Marin's iframe/API/WebSocket language and currency fields, Stripe's own display-locale setting, and payment transaction references are active protocols, not legacy website navigation.

**Why:** Changing transport field names or removing transaction identifiers would break working integrations. A language hint on a public return-page URL is different: it can safely become a locale path without changing the payment reference or status.

**How to apply:** Audit producers and consumers before changing parameters. Generate locale-path payment returns, preserve transaction identifiers, and route old cancellation documents to the native cancellation state. Do not invent successful bookings from obsolete return URLs.

Keep the website's selected locale separate from the narrower set of languages supported by Stripe's checkout interface.

**Why:** Falling back to Stripe's automatic UI language must not discard a supported website language when the guest returns.

**How to apply:** Derive public return paths from the full website locale, not the Stripe-locale conversion. Keep currency selection and payment amounts independent of this language handling.

Compatibility audits must cover copied HTML build inputs, not only the central router and application JavaScript.

**Why:** Inline booking-link emitters can still generate an old format after the main navigation has migrated. Truncated global searches dominated by archived pages can hide those active producers.

**How to apply:** Search shipped entry points separately and test their actual link-generation scripts, including locale, dates, occupancy, currency and accommodation selection, before removing the corresponding reader.

Verify compatibility redirects and retired responses through the proxied preview as well as edge-handler tests.

**Why:** The preview has a separate Express request stack; passing edge tests does not prove that old URLs behave the same locally.

**How to apply:** Share path guards where possible and include the relevant preview HTTP status in the focused checks.
