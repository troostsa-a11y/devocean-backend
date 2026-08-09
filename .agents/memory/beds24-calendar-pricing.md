---
name: Beds24 calendar-based pricing
description: How availability and pricing now work after the /offers → /calendar refactor; what to check if offers stop appearing.
---

# Beds24 calendar-based pricing

## The rule
`/inventory/rooms/offers` is no longer called. All pricing goes through two cached calls + one live calendar fetch.

**Why:** The old approach called `/offers` once per distinct occupancy combo per search, and up to 84 times for `findNearestAvailable`. The new approach is 1–2 calls per search and 1 call for nearest-available.

## How to apply
Three sources of data:
1. `loadProperty()` — room metadata, deposit policy. Cached 5 min. Auto-called.
2. `loadPrices()` — `/inventory/prices`: per-room `priceFor`, `extraPerson`, `extraChild`; per-plan `offerId`, `offerName`, `offsetPercent`, `minStay`, `maxStay`. Cached 30 min.
3. `fetchCalendarWindow(start, end)` — `/inventory/rooms/calendar` with `includePrices=true&includeNumAvail=true`. Returns `Map<roomId, Map<date, {price1, numAvail, closed}>>`. Called live per search (small window).

Price formula (in `calcOffers`):
```
baseTotal = Σ price1 for each night in stay
discountedBase = baseTotal × (1 + offsetPercent/100)
surcharge = max(0, adults - priceFor) × extraPerson × nights
           + children × extraChild × nights
total = round(discountedBase + surcharge)
```

Offer filtering per `OFFER_ADVANCE_BOOKING`:
- nonRef: daysToArrival ≤ 28
- earlyBird: daysToArrival ≥ 90
- lastMinute: daysToArrival ≤ 3
- semiFlex, minStay (≥3 nights), weekly (≥7 nights): no advance constraint

## Offer names
After this refactor, `offerName` in booking records comes from the `/inventory/prices` plan name (e.g. "Semi flexible", "Minimum stay") rather than the old offer code names ("DIR-SF-OFR", "DIR-MS-OFR"). Cosmetic only — doesn't affect pricing or deposit logic.

## If offers stop appearing
1. Check Render logs for `[BOOKING] availability error` — if `/inventory/prices` 404s or has an unexpected shape, `loadPrices()` throws and no offers are built.
2. The master plan (no `linkedTo`) is excluded from bookable offers. If Beds24 changes the plan structure, the master-detection heuristic (smallest id with no `linkedTo`) may need updating.
3. `numAvail` is trusted when present; if absent, the date is treated as available. A room with no calendar data for a date is treated as unavailable (closed:true fallback).
