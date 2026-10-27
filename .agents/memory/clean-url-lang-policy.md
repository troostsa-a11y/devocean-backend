---
name: Clean-URL lang policy
description: Site-wide rule for how ?lang= is handled on devoceanlodge.com
---
Rule: `?lang=xx` is an **entry-only compatibility** parameter. Ordinary public pages converge on the stable, same-origin locale URL, removing `lang` while preserving unrelated query parameters and anchors. Internal navigation uses the locale URL contract, never appended `?lang=` or `?currency=` preferences.

**Why:** Older shared links must continue to select the intended language without creating duplicate cache keys or ambiguous canonicals. Backward compatibility never justifies an off-site redirect.

**How to apply:** Use the shared locale-routing contract rather than reverting to storage-only language switching. Nontranslated legal and payment-return pages retain their own clean routes and stored language preferences. Normalize untrusted path forms before constructing redirect destinations, and keep language navigation same-origin.
