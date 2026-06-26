---
name: Direct-booking /availability response shape
description: Surfacing a new Beds24 room field to /book-direct requires edits at 3 layers, not 1
---

The `/availability` JSON the browser receives is built by an **explicit per-field
whitelist** that re-maps each room — it is NOT a pass-through of the internal
`RoomOffers` object. Adding a field only to the type + the service return compiles
clean but the field is silently dropped at the route boundary, so the frontend
sees `undefined`.

To surface any Beds24 room attribute (occupancy caps, amenities, etc.) to
`/book-direct`, edit all three:
1. the `RoomOffers` interface (beds24.ts)
2. the `getAvailability()` return object (beds24.ts)
3. the per-room `rooms.map(...)` whitelist in the `/availability` route (booking.ts)

**Why:** the route deliberately reshapes/whitelists room + offer fields (it also
injects deposit/balance split), so it is a real shaping boundary, not a proxy.

**How to apply:** the CF Function (`functions/api/booking/availability.js`) and the
dev proxy (`server.js` `proxyToAutomailer`) forward the upstream body verbatim, so
they need NO change — only the automailer's route does.
