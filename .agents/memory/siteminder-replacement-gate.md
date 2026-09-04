---
name: SiteMinder replacement gate
description: The non-negotiable API and architecture gates before replacing Beds24 with SiteMinder.
---

**Rule:** Do not replace Beds24 or build a production SiteMinder adapter until SiteMinder confirms a supported property-level reservation lifecycle and machine-readable reservation event delivery. The published Direct Booking API lists only property, room, rate, availability, and quote reads; it does not document reservation create, modify, or cancel operations.

**Why:** DEVOCEAN takes a Stripe deposit before creating a confirmed provider reservation, then compensates if inventory is unavailable. A read-only replacement would risk captured payments without reservations. SiteConnect, Channels Plus, pmsXchange, and SMX are partner products and must not be assumed available to a single property.

**How to apply:** Get written SiteMinder confirmation and pass an end-to-end sandbox proof before implementation. If property-level writes are unavailable, treat SiteMinder Direct Booking and its payment flow as a product replacement for the native checkout, not as a transparent Beds24 API swap. Keep exactly one authoritative booking writer during migration.