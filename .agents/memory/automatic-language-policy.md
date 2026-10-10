---
name: Automatic language policy
description: Requested website language priority and handling of browser translation offers.
---

For automatic website language selection, use the visitor's supported browser language first. Use IP-country language only when no supported browser-language preference is available. Preserve deliberate language choices and language-specific links rather than replacing them with an IP-based guess.

**Why:** The owner instructed that the website should respect browser language before IP location and wants to avoid Chrome translation offers, especially on phones, because the site already provides native translations.

**How to apply:** Apply this priority consistently when changing initial language selection and later detection. Do not treat an unsupported browser language as English before trying the IP fallback. Keep the page's declared language consistent with its displayed text from the initial load. Prefer the site's own translations, but do not promise that website markup can control every browser translation setting.

Keep automatic language negotiation before first paint on the client unless an edge-based replacement can honor existing manual preferences stored only in the browser. Preserve explicit entry-language intent through canonical redirects, especially for English's shared unprefixed URL.

**Why:** The edge cannot read browser-only saved preferences. An English redirect can otherwise lose the new explicit choice to an older manual language.

**How to apply:** An explicit locale URL or valid entry-language query wins; then a deliberate saved choice; then the first supported browser preference; then IP language; then English. Do not let deferred country detection change language. Keep country, automatic region and display currency independent of language. Marin must inherit the active full locale, including regional variants, rather than make another location-based guess.
