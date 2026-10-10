---
name: Automatic language policy
description: Requested website language priority and handling of browser translation offers.
---

For automatic website language selection, use the visitor's supported browser language first. Use IP-country language only when no supported browser-language preference is available. Preserve deliberate language choices and language-specific links rather than replacing them with an IP-based guess.

**Why:** The owner instructed that the website should respect browser language before IP location and wants to avoid Chrome translation offers, especially on phones, because the site already provides native translations.

**How to apply:** Apply this priority consistently when changing initial language selection and later detection. Do not treat an unsupported browser language as English before trying the IP fallback. Keep the page's declared language consistent with its displayed text from the initial load. Prefer the site's own translations, but do not promise that website markup can control every browser translation setting.
