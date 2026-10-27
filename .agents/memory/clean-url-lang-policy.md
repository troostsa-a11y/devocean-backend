---
name: Clean-URL lang policy
description: Retired public language queries and the requirement to justify legacy compatibility by actual use
---
Rule: Public website language selection uses the current locale paths, not `?lang=xx`. Do not retain or reintroduce legacy compatibility merely because old external links might exist; establish an actual app/email dependency or legitimate incoming use.

**Why:** The user explicitly approved removing unused compatibility instead of maintaining hypothetical old links indefinitely. It adds maintenance and security exposure without demonstrated value.

**How to apply:** Check current producers before removing compatibility, and inspect incoming traffic when available. Missing traffic data is not proof of zero use. Marin's API/iframe language parameters and payment-return arguments are separate contracts, not public-page locale queries; do not remove them through a blanket search-and-replace. Keep canonical navigation same-origin and independent of display currency.

Compatibility audits must cover copied HTML build inputs, not only the central router and application JavaScript.

**Why:** Inline booking-link emitters can still generate an old format after the main navigation has migrated. Truncated global searches dominated by archived pages can hide those active producers.

**How to apply:** Search shipped entry points separately and test their actual link-generation scripts, including locale, dates, occupancy, currency and accommodation selection, before removing the corresponding reader.
