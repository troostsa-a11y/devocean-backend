# Booking currency policy

## Display selection

1. Saved, manual currency selection.
2. Explicit browser currency preference or regional locale.
3. IP-country currency.
4. USD.

Examples: `de-DE` → EUR, `de-CH` → CHF, `en-ZA` → ZAR.
A bare language such as `de` does not identify a country or currency.
Language and region selectors do not overwrite currency preferences or IP geography.

## Payment selection

| Website currency | Stripe booking-deposit currency |
| --- | --- |
| EUR | EUR |
| ZAR | ZAR |
| USD or any other currency, including MZN | USD |

Website FX conversions remain estimates. Only the booking server calculates the
actual payment amount. The checkout locks and saves that amount in integer minor
units before creating the Stripe session. Adaptive Pricing is disabled per
session. Property prices, coupon/voucher accounting, Beds24 deposits credited,
arrival balances and analytics remain in the original property currency.

Refunds refer to the original Stripe PaymentIntent and refund its actual charge,
not a new conversion. Existing bookings without a separate payment quote keep
their original payment currency and amount. Gift vouchers remain USD-only.

If payment FX is unavailable, EUR/ZAR checkout fails explicitly: the guest can
retry or select USD. It never silently charges a different currency.

## Release and manual verification

No live booking, payment or deployment is needed to run the isolated unit tests.
Run these when ready:

```sh
cd render-automailer && npm test
cd ../WebsiteProject && npm test -- src/i18n/__tests__/visitorCurrency.test.js src/i18n/__tests__/visitorLanguage.test.js src/i18n/__tests__/useLocale.language.test.jsx src/components/__tests__/BookingPaymentNotice.test.jsx src/components/__tests__/BookDirectPage.checkout.test.jsx src/components/__tests__/BookingConfirmedPage.analytics.test.jsx
```

Deploy **Automailer first**, then the website, then Marin's API. Automailer adds
the optional payment-quote column using its existing additive startup migration.
The frontend remains compatible with old API responses but cannot enable the
new payment policy before the backend is released.

For payment QA, use Stripe test mode and create **fresh** Checkout Sessions.
Old sessions may retain their previous Adaptive Pricing choices.

- German regional browser locale with a Mozambique IP: website EUR, actual
  country still Mozambique, Stripe EUR.
- Bare German browser language with a Mozambique IP: website MZN, Stripe USD.
- Manual ZAR override with any browser/IP: website ZAR, Stripe ZAR.
- GBP/CHF/MZN display: approximate prices in that currency, Stripe USD.
- No usable browser region and no IP country: USD.
- Receipt/confirmation shows the actual Stripe deposit currency; the arrival
  balance and analytics stay in the property's base currency.
- Signed payment events with a mismatched session, currency or amount must
  alert reception without creating a booking or automatically refunding.

The Stripe booking webhook handles both `checkout.session.completed` and
`checkout.session.async_payment_succeeded`. Ensure the persistent endpoint
subscribes to both if delayed payment methods are enabled in Stripe.
