---
name: Marin pricing proxy
description: How/why Marin's check_availability proxies to the booking engine instead of calling Beds24 directly.
---

## Rule
Marin's `check_availability` tool calls `${AUTOMAILER_URL}/api/booking/availability` (the booking engine) rather than Beds24 directly. It uses `x-admin-key: ${ADMIN_API_KEY}` for auth.

**Why:** When Marin called Beds24 independently it quoted different (higher) prices:
1. Beds24 returns offers in arbitrary order. The booking engine sorts by `total` ascending and picks the cheapest. Marin was taking `offerList[0]` — often a pricier standard rate.
2. The booking engine applies property-level `priceRounding` (nearestOne → Math.round); Marin used raw `Number(price)`.
3. The booking engine uses `displayOccupancy()` to cap adults/children to room capacity before querying; Marin passed raw counts.

**How to apply:** `voice-reception/artifacts/api-server/src/beds24/client.ts` is now a thin proxy. Any future availability-related feature in Marin must go through the booking engine — never add a direct Beds24 connection to the api-server.

## Related stale-type fix
`voice-reception/lib/api-zod/` is a `composite: true` project. When `src/generated/api.ts` is updated, `dist/*.d.ts` must be regenerated via `npx tsc -p tsconfig.json` from within that directory before `typecheck` on dependents will see the new fields.

## Group pricing boundary
Group availability suggestions are not group quotes. Do not multiply the
availability endpoint's per-unit display rate by group size or divide it by
the whole party. Exact multi-unit pricing requires a guest allocation and cart quote.

**Why:** The legacy probes calculated totals for more units of a type than were
in stock and treated a missing remainder rate as zero. Families also need infant
capacity counted even where infants have no charge.

**How to apply:** Preserve booking-engine capacity metadata, suggest only
stock-respecting combinations, and qualify these as pending allocation/rate
verification in direct booking. Never equate insufficient group capacity with
the entire lodge being sold out.
