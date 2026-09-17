---
name: Direct-booking pricing authority
description: Preserve local pricing when enforcing Beds24 restrictions; distinguish restriction failures from upstream errors.
---

# Preserve local pricing while enforcing Beds24 restrictions

The owner's explicit requirement is to keep locally calculated prices and rate-plan rules while enforcing Beds24's calendar restrictions at search, checkout and final confirmation. Do not switch back to Beds24 offer prices as a shortcut for enforcing restrictions.

**Why:** Local rate-plan minimums alone allowed a short stay despite a stricter minimum set in the Beds24 calendar. The correction concerns booking eligibility, not the source or amount of guest prices.

**How to apply:** Treat room/calendar restrictions and local plan eligibility as cumulative requirements. Keep season rates, surcharges, rounding and deposits unchanged for eligible stays. Fetch the departure date for no-check-out rules, without treating it as an occupied or chargeable night. Unreadable/incomplete restriction data is an upstream failure, not proof that a paid booking must be refunded.

Historical guidance to price from raw Beds24 offers is superseded. The no-extra-OTA-multiplier decision remains: the booking-page multiplier was intended for other channels, not a direct-booking surcharge.

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
