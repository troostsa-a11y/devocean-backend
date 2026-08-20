---
name: Per-unit occupancy pricing (book-direct)
description: How explicit per-unit guest counts flow from UI steppers → cartLines → backend → Beds24, and the children-only floor pattern.
---

## The rule

When a party includes children or infants, each booked unit carries its actual adult/child/infant split, and pricing follows that split rather than silently redistributing guests.

**Why:** Beds24 per-person pricing means 2A in one room + 0A in another ≠ 1A in each room. The auto-distributor guaranteed ≥1 adult per room which misprice children-only units.

For lodging capacity, infants count as physical occupants even though they remain excluded from chargeable Beds24 child pricing. Garden Cottage is a strict two-person unit; Safari, Comfort, and Chalet use a two-adult-plus-one-child/infant-slot policy.

**Why:** A 2-adult + infant party must not be offered a single Garden Cottage or pass quote validation merely because infants are free in the rate calculation.

Before Continue, explicit per-unit occupancy must also match the requested adult/child/infant counts exactly; room capacity alone is insufficient because a 2-adult Safari unit can physically hold a third infant/child.

**Why:** Otherwise the results header can say “3 guests” while the reservation carries only the two adults shown in the unit steppers.

## offersForOccWithFloor pattern

For children-only units (`adults === 0`), fetch two Beds24 rates in parallel:
1. `offersForOcc(0, c)` — actual per-child rate
2. `offersForOcc(1, 0)` — 1-adult floor rate

Apply max(child rate, floor rate) per offer. This ensures a children-only unit is never cheaper than a single-adult booking (lodge minimum rate policy).

Units with `adults > 0` pass through `offersForOcc(a, c)` directly — no floor needed.

## Rate-not-changing observation

If the quote re-fires (loading spinner visible) but the price doesn't change, the cause is **Beds24 returning the same rate** for different occupancy — i.e., flat room rate for those dates, not per-person pricing. This is a Beds24 rate-plan config issue, not a code bug. The code correctly sends different `numAdults`/`numChildren` to Beds24 each time.

## Children-only units

Children-only unit assignments are valid. They must still respect the lodge's minimum-rate policy, so a children-only rate should never undercut the comparable single-adult rate.
