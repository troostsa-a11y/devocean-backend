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
