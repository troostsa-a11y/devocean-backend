---
name: Beds24 calendar-based pricing
description: How availability and pricing work after the full local-pricing refactor; what to check if offers stop appearing; room rate table.
---

# Beds24 calendar-based pricing

## The rule
Beds24 is queried **only for availability** (numAvail + closed per date). All pricing is local.

**Why:** `/inventory/rooms/offers` was per-search (up to 84 calls for nearest-available). `/inventory/prices` didn't exist in the Beds24 v2 API and broke the engine on deploy. Calendar is the only Beds24 data source now.

## Architecture (three sources)
1. `loadProperty()` — room metadata, deposit policy. Cached 5 min.
2. `fetchCalendarWindow(start, end)` — `/inventory/rooms/calendar?includeNumAvail=true` (no `includePrices`). Returns `Map<roomId, Map<date, {numAvail, closed}>>`. One call per availability search.
3. `season-config.ts` — 100% local, no Beds24 call:
   - `ROOM_RATES[roomId]` → `{shoulder, extraAdult, extraChild}` per room
   - `SEASON_RANGES` → date ranges → `getSeasonForDate(date)` → `SeasonType`
   - `SEASON_MULTIPLIERS` → season rate = shoulder × multiplier
   - `getNightlyRate(roomId, date)` → nightly master rate
   - `getExtraAdultRate(roomId)` + `getExtraChildRate(roomId)` → per-room surcharges

## Price formula (in `calcOffers`)
```
baseTotal   = Σ getNightlyRate(roomId, date) for each night
extraAdults = max(0, adults - 1)            // base always covers 1 adult
surcharge   = extraAdults × getExtraAdultRate(roomId) × nights
            + children   × getExtraChildRate(roomId)  × nights
offer total = round(baseTotal × (1 + offsetPercent/100) + surcharge)
```

## Offer plans (hardcoded in beds24.ts OFFER_PLANS)
All offerId values verified against Beds24 /inventory/rooms/offers for property 297012.
Plans 5-7 only appear when the query date range satisfies their booking-window constraints.

| offerId | Beds24 code | type | minStay | offset |
|---|---|---|---|---|
| 2 | DIR-SF-OFR | semiFlex | 1 | 0% |
| 3 | DIR-NR-OFR | nonRef | 1 | −8% |
| 4 | DIR-MS-OFR | minStay | 3 | −10% |
| 5 | DIR-WS-OFR | weekly | 7 | −15% |
| 6 | DIR-EB-OFR | earlyBird | 1 | −12% |
| 7 | DIR-LM-OFR | lastMinute | 1 | −10% |

Advance-booking gates: nonRef ≤28d, earlyBird ≥90d, lastMinute ≤3d.

## Shoulder season rate table (from operator)
| Room | 1 adult | 2 adults | extra child | extraAdult | extraChild |
|---|---|---|---|---|---|
| Safari Tent | $52 | $79 | $27 | $27 | $27 |
| Comfort Tent | $67 | $99 | $32 | $32 | $32 |
| Garden Cottage | $82 | $119 | N/A | $37 | 0 |
| Thatched Chalet | $91 | $129 | $40 | $38 | $40 |

Season multipliers: special=85%, low=93%, shoulder=100%, high=118%, peak=138%.

## Room IDs (confirmed from live Beds24 API)
| Beds24 ID | Name |
|---|---|
| 620540 | Comfort Tent - private bathroom |
| 620541 | Garden Cottage - AC |
| 620542 | Safari Tent - shared bathrooms |
| 620543 | Thatched Chalet - AC |

## If offers stop appearing
1. Check `ROOM_RATES` in `render-automailer/server/config/season-config.ts` — if a roomId isn't in there, `getNightlyRate` returns 0 and no offers are built.
2. Check Render logs for calendar endpoint errors (loadProperty or fetchCalendarWindow failures).
3. If all rooms show `available: false` with 0 offers, the room IDs in ROOM_RATES don't match what Beds24 returns for the property.

## getPriceCalendar
Now pure local computation — no Beds24 call. Iterates dates, calls `getNightlyRate` per room, takes minimum. Cached 30 min.

## findNearestAvailable
ONE calendar fetch for the full ±105-day window, local scan. windowOk checks numAvail > 0 AND getNightlyRate > 0.
