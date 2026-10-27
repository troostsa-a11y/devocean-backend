---
name: Clean-URL lang policy
description: Locale-path generation and the confirmed decision to retain bounded inbound language-query compatibility
---
Rule: Generate only current locale-path website links, not `?lang=xx`. Retain a bounded same-origin adapter for incoming old language links; do not restore independent query readers throughout the frontend.

**Why:** After the usage check found recent legacy requests, including requests that could not be classified as crawlers, the user explicitly chose to keep safe inbound support. A current-app migration alone is not evidence that incoming links have stopped being used.

**How to apply:** Limit the adapter to registered public documents and supported language codes, honour an existing locale path, and preserve booking fields, currency and fragments. Never use query parameters as redirect destinations. Reconsider removal only with evidence of no remaining incoming use or explicit user approval. Marin's API/iframe language parameters and payment-return arguments are separate contracts; do not change them through a blanket search-and-replace.

Compatibility audits must cover copied HTML build inputs, not only the central router and application JavaScript.

**Why:** Inline booking-link emitters can still generate an old format after the main navigation has migrated. Truncated global searches dominated by archived pages can hide those active producers.

**How to apply:** Search shipped entry points separately and test their actual link-generation scripts, including locale, dates, occupancy, currency and accommodation selection, before removing the corresponding reader.
