---
name: Direct-booking offers pricing
description: How the native /book-direct flow prices stays (raw Beds24 offer price, no markup), and the deposit policy rules.
---

# Direct-booking pricing = raw Beds24 offer price, no markup

The native `/book-direct` flow (Beds24 REST + Stripe deposit) charges the offer's **base** price as-is — the property's `bookingPageMultiplier` (e.g. `*1.10`) must NOT be re-applied on top of it.

**Rule:** guest-facing total = offer **base** total, rounded per the property `priceRounding` (`nearestOne` → `Math.round`, else 2dp).

**Why (corrected 2026-07-08):** `bookingPageMultiplier` is a Beds24-side OTA rate-parity tool the lodge owner uses to mark rates up on *other* channels — it is not meant to be reapplied on the direct-booking channel. An earlier version of this code multiplied the offer price by it to match the (now-removed) Beds24 iframe, which itself applied the multiplier — that reasoning no longer applies since the iframe is gone, and doing so was overcharging direct-booking guests by the multiplier amount. Confirmed via a real guest complaint: charged total implied the raw Beds24 rate × 1.10, rounded to nearest dollar.

**How to apply:**
- Price from `GET /inventory/rooms/offers?propertyId=&arrival=&departure=&numAdults=&numChildren=` **without** `roomId` — passing `roomId` suppresses the `offers[]` array. Each `data[]` entry is a room; each `offers[]` entry is a rate plan (`offerId`, `offerName`, `price` = whole-stay base total, `unitsAvailable`).
- Offer code → type is parsed from the suffix in `offerName` (e.g. `DIR-SF-OFR`→SF=semiFlex, NR=nonRef, MS=minStay, WS=weekly, EB=earlyBird, LM=lastMinute). `refundable = type !== 'nonRef'`.
- Currency/rounding/policy come from `GET /properties?id=&includeAllRooms=true`, cached ~5 min in `loadProperty()`. Do not resurrect a multiplier lookup here without re-confirming with the lodge owner first.

# Deposit policy (mirrors Beds24)

- Normal arrival: **50%** deposit now, balance on arrival.
- **100%** (full prepayment) when arrival is within `bookingNearTypeDays` (7) of today **OR** arrival falls inside the exceptional window (2026-12-28 .. 2027-01-04).
- **Exception — rate-plan overrides arrival date:** a `lastMinute` (`LM`) offer is always **100%** deposit regardless of arrival-date proximity. Use `getDepositPercentForOffer(checkIn, offer.type)`, not `getDepositPercentForArrival`, anywhere a specific offer/leg is being priced — the arrival-only function is only correct when every leg in the quote shares one rate plan.
- In a mixed multi-room cart, each leg must price its OWN deposit % (never proportionally blend one arrival-based deposit across legs) — a last-minute leg must independently be charged 100% even if other legs in the same cart are on a 50% rate.

# Trust boundary

Client-supplied money is never trusted: the server re-quotes live offers and re-selects the chosen plan **by `offerId`** at checkout, and runs a **full fresh server-side re-quote at Stripe webhook time** before creating the Beds24 booking(s).

**Webhook recompute policy (non-obvious — keep it):**
- The webhook re-runs the *same* `computeCartQuote` used at checkout (cart lines reconstructed from the persisted legs: qty per `roomId+offerId`). `distributeGuests` is deterministic, so fresh legs line up 1:1 with stored legs.
- That single re-quote serves two purposes: (1) the **sell-out guard** (it throws `BookingCartError` for `SOLD_OUT`/`UNITS_EXCEEDED`/capacity), and (2) **rate-drift detection** vs the stored total.
- **The guest is charged the price quoted + paid at checkout (stored on the legs), NOT the fresh webhook price.** Rate drift in the seconds/minutes payment window is only logged (`price drift at webhook for <ref>`), never re-charged or refunded — refunding a paying guest over a tiny good-faith rate move is wrong product behavior. This matches the original single-room design's intent.
- **Error discrimination is critical:** `BookingCartError` = definitive sell-out → auto-refund + mark `sold_out_refunded`. A `Beds24Error`/transient upstream failure must be **rethrown so Stripe retries** — do NOT treat "re-quote threw" as "sold out" (the old `legsStillAvailable` catch-all `ok=false` would auto-refund a paying guest on a transient Beds24 blip; the re-quote path fixes that).

**Why:** "recompute at webhook" (documented in replit.md) means re-validate availability + re-derive the authoritative price server-side; it does NOT mean charge whatever the webhook quote says. The deposit was already captured by Stripe against a server-computed checkout quote, so honoring that quote is both faithful and correct.

**Known limitation:** Beds24 has no idempotency key, and a leg is created then its id persisted in two steps — a crash between them lets a retry re-create that leg (same window existed in the single-room design). The `claimDirectBookingForProcessing` claim + per-leg id persistence + 2-min stale-processing reclaim covers normal concurrent retries, not a hard crash mid-create.
