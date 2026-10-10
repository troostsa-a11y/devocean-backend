---
name: Direct-booking FX display
description: Owner-approved browser/manual currency priority and strict USD/EUR/ZAR booking-payment policy
---

## Display priority

**Rule:** the owner approved manual choice first, then an explicit browser
currency/region, then IP country, then USD. A bare language does not establish a
currency: German in Switzerland is not evidence for EUR. Site language/region
selection must not change currency or overwrite the actual IP geography.

**Why:** the owner wants the visitor's own settings respected rather than an
IP-only guess, especially when travelling.

**How to apply:** preserve deliberate overrides across visits and use explicit
regional browser tags, never an inferred region derived from the chosen language.

## Strict booking-payment policy

**Rule:** USD is the default/fallback payment currency. EUR or ZAR are permitted
only when they match the chosen website currency. MZN and all other currencies
may remain display estimates but must pay in USD. Native property prices,
deposit credits, arrival balance, vouchers and revenue attribution stay in the
property's base currency. Gift vouchers remain USD-only.

**Why:** the owner reported guests being offered MZN and then unable to pay, and
authorized only USD/EUR/ZAR without changing the lodge's underlying pricing.

**How to apply:** accept a currency preference, never a browser FX rate or
converted amount. Server-calculated charges must be locked, persisted and
verified against Stripe events; refunds must use the original Stripe charge,
not current FX. A failed FX lookup must be explicit, not a silent currency switch.

**Marin parity:** distinguish base prices, approximate display amounts, actual
card-payment currency and the arrival balance. Do not claim all charges are USD
when an EUR/ZAR payment has been quoted.

## Stripe's separate currency localization

Website FX estimates and Stripe's card-payment currency selection are separate controls. Submitting base-currency prices does not guarantee that Checkout offers only that currency.

**Why:** Stripe Adaptive Pricing can offer a local payment currency while reporting the original integration amount and currency in its events. Defining manual prices for selected currencies overrides localization for those currencies but does not block other automatically localized currencies.

**How to apply:** A strict payment-currency policy needs explicit control over Stripe localization, not just a website currency filter. Any new non-base-currency charge must use server-calculated, locked amounts with consistent payment verification and refund accounting; never reuse a client FX estimate. Check fresh Checkout Sessions after changes, because disabling localization does not remove it from already-converted sessions.

Stripe lists MZN as a supported presentment currency in its [currency documentation](https://docs.stripe.com/currencies). A reported MZN payment failure is not proof of universal Stripe rejection; check the specific account, payment method and issuer error before naming the cause.
