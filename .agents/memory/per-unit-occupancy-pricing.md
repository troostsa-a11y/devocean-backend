---
name: Per-unit occupancy pricing (book-direct)
description: How explicit per-unit guest counts flow from UI steppers → cartLines → backend → Beds24, and the children-only floor pattern.
---

## The rule

When the party has children or infants (`effChildren > 0 || effInfants > 0`), the booking UI expands each room in the cart into individual unit entries with explicit `adults/children/infants` fields. The backend detects these via `hasExplicitOcc = lines.some(l => l.adults !== undefined)` and prices each unit independently rather than running the auto-distributor.

**Why:** Beds24 per-person pricing means 2A in one room + 0A in another ≠ 1A in each room. The auto-distributor guaranteed ≥1 adult per room which misprice children-only units.

## offersForOccWithFloor pattern

For children-only units (`adults === 0`), fetch two Beds24 rates in parallel:
1. `offersForOcc(0, c)` — actual per-child rate
2. `offersForOcc(1, 0)` — 1-adult floor rate

Apply max(child rate, floor rate) per offer. This ensures a children-only unit is never cheaper than a single-adult booking (lodge minimum rate policy).

Units with `adults > 0` pass through `offersForOcc(a, c)` directly — no floor needed.

## Condition consistency requirement

Three places must use the SAME `(effChildren > 0 || effInfants > 0)` guard:
1. **Frontend render** — `occArray != null` → per-unit steppers visible
2. **cartLines useMemo** — takes the explicit-occupancy branch, emits `{adults, children, infants}` per line
3. **Backend** — `hasExplicitOcc` detection (implicit: if frontend sends adults field, backend uses explicit path)

If these conditions drift, steppers appear but cartLines takes the wrong branch (or vice versa) and changing occupancy has no effect on the quote.

## Rate-not-changing observation

If the quote re-fires (loading spinner visible) but the price doesn't change, the cause is **Beds24 returning the same rate** for different occupancy — i.e., flat room rate for those dates, not per-person pricing. This is a Beds24 rate-plan config issue, not a code bug. The code correctly sends different `numAdults`/`numChildren` to Beds24 each time.

## Key files

- `render-automailer/server/services/booking-cart.ts` — `offersForOccWithFloor`, `hasExplicitOcc`, `distributeGuests`, `mergeLines`
- `WebsiteProject/src/components/BookDirectPage.jsx` — `roomOccupancy` state, `setRoomOcc`, `cartLines` useMemo, `defaultRoomOcc`

## normalizeLine: 0 adults allowed

`normalizeLine` uses `Math.max(0, adults)` — 0-adult lines are valid (children-only unit). Do NOT change to `Math.max(1, ...)` — that would silently promote children-only units to 1-adult pricing before `offersForOccWithFloor` can apply the floor correctly.
