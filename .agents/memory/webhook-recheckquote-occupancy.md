---
name: Webhook recheck occupancy stripping bug
description: recheckCartQuote must preserve per-leg adults/children/infants or distributeGuests() throws PARTY_TOO_LARGE when Beds24 reports maxChildren=0
---

## The bug

`recheckCartQuote` (inside the Stripe webhook handler in `render-automailer/server/routes/booking.ts`) rebuilt cart lines as `{roomId, offerId, qty}` — stripping the per-leg `adults`/`children`/`infants` that were stored at checkout time.

`computeCartQuote` only sets `hasExplicitOcc = true` when a cart line has an `adults` field. Without it, it falls back to `distributeGuests()`.

Beds24 reports `maxChildren = 0` for every room type at this property. `distributeGuests()` caps children added to a slot at `maxChildren = 0`, so it can never place any children — `remChildren > 0` after the loop → throws `PARTY_TOO_LARGE` (a `BookingCartError`).

Any `BookingCartError` from `recheckCartQuote` triggers `refundSoldOut()` → status `sold_out_refunded` → erroneous full refund.

**Why checkout succeeded but webhook failed:** At checkout the browser sends explicit per-unit occupancy (e.g. `adults:2, children:1` per room entry) because `effChildren > 0` triggers the expand-to-qty-1 path in `cartLines`. At webhook the explicit occupancy was stripped when rebuilding from legs.

## The fix

Preserve `adults`, `children`, `infants` from each stored leg in the `lineMap`, and include them in the occupancy key so different per-unit splits stay separate:

```typescript
const key = `${leg.roomId}__${leg.offerId ?? 'any'}__${leg.adults ?? ''}_${leg.children ?? ''}_${leg.infants ?? ''}`;
lineMap.set(key, { roomId, offerId, qty: 1, adults: leg.adults, children: leg.children, infants: leg.infants ?? 0 });
```

This makes `hasExplicitOcc = true` in `computeCartQuote`, bypassing `distributeGuests()` — exactly mirroring the checkout path.

**Why:**
- Any booking with children (effChildren > 0) was guaranteed to trigger a false sell-out refund
- Adult-only bookings never hit `distributeGuests` children distribution → unaffected

## How to apply

- Any change to how legs are rebuilt for the webhook recheck must preserve per-unit occupancy
- The `recheckCartQuote` key must match the `mergeLines` key in `computeCartQuote` (`roomId__offerId__adults_children_infants`)
- Test: a booking with children (any age 4-12) should confirm correctly end-to-end
