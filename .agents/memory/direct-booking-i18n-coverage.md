---
name: Direct-booking i18n coverage
description: bookingStrings.js covers all 20 base langs; whole-object fallback means every key must exist in every lang object
---

The `/book-direct` + `/booking-confirmed` copy in `WebsiteProject/src/i18n/bookingStrings.js`
(`STRINGS` + `CONFIRM_STRINGS`) is authored for all 20 user-facing base langs. It was
originally only 7 (en, pt, de, fr, es, it, nl) because the old Beds24 booking engine only
served those locales; that limit is gone, so all 20 are now first-class.

**Rule: every booking string key must exist in every language object (incl. the nested `rate`).**
**Why:** `getBookingStrings`/`getConfirmStrings` do a *whole-object* fallback
(`STRINGS[base] || STRINGS.en`), NOT per-key. A partial language object renders its missing
keys as `undefined` on the live page — it does NOT fall back to English per key.
**How to apply:** when adding/renaming a booking string key, add it to ALL base lang objects
(and `rate`'s 7 sub-keys). `RATE_TIER_STRINGS` is a separate overlay but also covers all 20.

Stripe checkout `locale` (`toStripeLocale` in render-automailer `stripe-booking.ts`) maps only
Stripe-supported locales; sr/af/zu/sw resolve to `'auto'` (Stripe's own default chrome) —
acceptable, our page copy is still localized. Not a bug.
