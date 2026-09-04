---
name: SiteMinder replacement gate
description: The non-negotiable API and architecture gates before replacing Beds24 with SiteMinder.
---

**Rule:** Do not replace Beds24 or build a production SiteMinder adapter until SiteMinder confirms a supported property-level reservation lifecycle and machine-readable reservation event delivery. The published Direct Booking API lists only property, room, rate, availability, and quote reads; it does not document reservation create, modify, or cancel operations.

**Why:** DEVOCEAN takes a Stripe deposit before creating a confirmed provider reservation, then compensates if inventory is unavailable. A read-only replacement would risk captured payments without reservations. SiteConnect, Channels Plus, pmsXchange, and SMX are partner products and must not be assumed available to a single property.

**How to apply:** Get written SiteMinder confirmation and pass an end-to-end sandbox proof before implementation. If property-level writes are unavailable, treat SiteMinder Direct Booking and its payment flow as a product replacement for the native checkout, not as a transparent Beds24 API swap. Keep exactly one authoritative booking writer during migration.

## Confirmed target direction

**Rule:** The planned target is for the DEVOCEAN app to host reservations and act as the PMS/system of record. SiteMinder should distribute inventory and push SiteMinder-originated reservations, modifications, and cancellations into DEVOCEAN through pmsXchange; DEVOCEAN should push availability, rates, and restrictions back to SiteMinder.

**Why:** This preserves DEVOCEAN's custom direct-booking and Stripe capabilities while replacing Beds24's channel-manager role. It also avoids depending on the read-only Direct Booking API for reservation creation.

**How to apply:** Treat SiteMinder-originated payment status separately from reservation confirmation. Prove the exact SiteMinder Payments and OTA payment fields, PCI obligations, idempotency, and retry behavior during partner certification. Direct bookings paid through DEVOCEAN's Stripe flow should be created locally and reflected to SiteMinder through inventory updates, not round-tripped as SiteMinder reservations.