---
name: Direct-booking offers pricing
description: How the native /book-direct flow prices stays to match the Beds24 iframe, and the deposit policy rules.
---

# Direct-booking pricing must mirror the Beds24 iframe

The native `/book-direct` flow (Beds24 REST + Stripe deposit) must produce the **same price the Beds24 iframe shows**, otherwise guests see two different prices for the same room.

**Rule:** guest-facing total = offer **base** total × `bookingPageMultiplier` (currently ×1.10), then rounded per the property `priceRounding` (`nearestOne` → `Math.round`).

**Why:** the iframe applies a booking-page markup multiplier and rounding on top of the raw rate-plan price; the REST `offers` endpoint returns only the *base* total, so the multiplier+rounding must be re-applied server-side to match.

**How to apply:**
- Price from `GET /inventory/rooms/offers?propertyId=&arrival=&departure=&numAdults=&numChildren=` **without** `roomId` — passing `roomId` suppresses the `offers[]` array. Each `data[]` entry is a room; each `offers[]` entry is a rate plan (`offerId`, `offerName`, `price` = whole-stay base total, `unitsAvailable`).
- Offer code → type is parsed from the suffix in `offerName` (e.g. `DIR-SF-OFR`→SF=semiFlex, NR=nonRef, MS=minStay, WS=weekly, EB=earlyBird, LM=lastMinute). `refundable = type !== 'nonRef'`.
- Multiplier/currency/rounding/policy come from `GET /properties?id=&includeAllRooms=true`, cached ~5 min in `loadProperty()`.

# Deposit policy (mirrors Beds24)

- Normal arrival: **50%** deposit now, balance on arrival.
- **100%** (full prepayment) when arrival is within `bookingNearTypeDays` (7) of today **OR** arrival falls inside the exceptional window (2026-12-28 .. 2027-01-04).
- Deposit % depends only on the **arrival date**, so it is identical for every room/offer in one search — compute once via `getDepositPercentForArrival(checkIn)`.

# Trust boundary

Client-supplied money is never trusted: the server re-quotes live offers and re-selects the chosen plan **by `offerId`** at checkout, and re-checks availability (offer still present) at Stripe webhook time before creating the Beds24 booking. The webhook still auto-refunds + marks `sold_out_refunded` if the room/offer vanished during payment.
