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

## Dates without an explicit year

Use the nearest upcoming occurrence according to the lodge's calendar in
Africa/Maputo, allowing same-day arrival. Preserve a year the guest explicitly
provides; clarify a past explicit date instead of silently moving it forward.

**Why:** The user confirmed that the nearest future date makes the most sense
for yearless booking requests. A rejected date must not be described to guests
as an inability to access live availability.

**How to apply:** Keep this policy consistent across text and voice. Preserve
the distinction between an omitted year and an explicit year until server-side
resolution, handle December/January rollover, and separate input-validation
feedback from genuine connection failures.

## Offer a nearest-available-date search

When the preferred stay or room type is unavailable, Marin should ask,
"Would you like me to check for the nearest available date?", naturally
translated into the guest's language, and wait for agreement before searching.
An explicit request for nearby dates also supplies agreement.

**Why:** The user requested the same alternative-date capability as the direct
booking page, with a conversational offer rather than an automatic search.

**How to apply:** Share the booking engine's search instead of creating a
separate scan or inventing dates. Preserve the stay length, adult/child/infant
counts and room preference. Verify suggestions against fresh availability
before presenting them, and never describe an incomplete search as sold out
or a partially checked alternative as the nearest across the whole lodge.
Group-capacity suggestions still are not confirmed group quotes.
