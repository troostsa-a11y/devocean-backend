---
name: Direct-booking FX display
description: How /book-direct shows approximate converted prices without ever affecting the charged amount
---

The `/book-direct` page shows each price (offer total, deposit, balance) in the
Beds24 property currency (the charged/base currency, `availability.currency`)
PLUS an approximate value in the visitor's display currency.

**Rule:** the conversion is display-only and must NEVER reach checkout. Stripe is
always charged the base currency; the automailer re-prices server-side from Beds24
at checkout + webhook. No converted amount, FX rate, or display currency is ever
submitted from the client (checkout payload stays roomId/offerId/dates/guest).

**Why:** payment is the source of truth and is recomputed server-side; mixing a
client FX estimate into the charge would be both wrong (rates drift) and a
tampering vector.

**How to apply:** rates come from a same-origin `/api/fx?base=<USD>` proxy (CF
Pages Function `functions/api/fx.js` + dev mirror in `server.js`) backed by
open.er-api.com (free, no key, CORS). Cached ~6h at the edge + ~6h in
localStorage, keyed AND gated by base currency so a base change can't render stale
rates. Convert into the same `currency` prop the top bar shows. Missing target
rate / fetch failure / base===display all degrade to hiding the approx line. The
`approxNote` i18n key lives in all 7 booking base languages; other website langs
fall back to English via `getBookingStrings`.

## Manual display-currency override (country picker)

The display `currency` is auto-detected from the visitor's IP country, but a guest
can override it on `/book-direct` by clicking the top-bar language·currency pair,
which opens a searchable country picker
(`WebsiteProject/src/components/CurrencyPicker.jsx`). Selecting a country sets that
country's national currency (`CC_TO_CURRENCY`) as the display currency.

**Rule:** the override is display-only too — it only changes the approx-FX target +
the top-bar label, never the charged amount (offers still render with
`room.currency` / base). Persist with `site.currency.source="user"` so the IP-based
`useLocale` initializer never clobbers it (same precedence pattern as
`site.lang_source`). `setCurrency(currency, country)` in `useLocale.js` is the only
currency writer after init. Picker labels use 3 i18n keys
(`currencyLabel`/`currencySearch`/`currencyNoMatches`) in the 7 base langs; country
names localize via `Intl.DisplayNames`. Currently desktop/tablet only (`sm:`).
