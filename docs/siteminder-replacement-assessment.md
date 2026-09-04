# SiteMinder as a Beds24 Replacement

**Assessment date:** 4 September 2026  
**Decision:** Conditional go for vendor validation; no-go for production replacement until reservation-write access is proven.

## Executive summary

SiteMinder is a credible replacement for Beds24's hotel-distribution role. Its platform can centralise room inventory, rates, restrictions, OTA channels, reservations, direct booking, payments, and commercial reporting.

The current DEVOCEAN application, however, depends on more than channel management. It uses Beds24 as the authoritative booking API behind:

- The native `/book-direct` search, rate-plan, price-calendar, cart, and checkout flow
- A Stripe deposit checkout that creates a reservation only after a verified payment webhook
- A final availability recheck and automatic refund if inventory has sold out
- Multi-room and occupancy-aware pricing
- Marin's live availability tool
- OTA booking, modification, and cancellation ingestion for the automailer
- Guest CRM enrichment and server-side GA4 purchase attribution

SiteMinder's documented property-level **Direct Booking API** supports reading properties, room types, room rates, availability, and quotes. Its published endpoint list contains only `GET` operations and stops at quote generation. It does not document creating, modifying, or cancelling reservations after a property takes payment through its own Stripe checkout.

The other SiteMinder APIs that do handle reservation lifecycles are partner products:

- **SiteConnect** is for booking channels, OTAs, wholesalers, and distribution partners.
- **Channels Plus** is for booking channels selling SiteMinder inventory at scale.
- **pmsXchange** is for PMS, RMS, and CRS vendors.
- **SMX** is for applications and RMS vendors receiving reservation data and being listed in the Hotel App Store.

Those products should not be treated as available to one hotel without written commercial approval and, where applicable, partner onboarding, testing, and certification.

There are therefore two realistic replacement paths:

1. **Preserve the DEVOCEAN booking UI and Stripe checkout** only if SiteMinder confirms a supported property-level reservation-write path.
2. **Adopt SiteMinder's booking engine and payment flow**, then adapt DEVOCEAN's automailer, attribution, and receptionist around the resulting reservation feed.

The first path best preserves the current guest experience and controls. The second is more clearly aligned with SiteMinder's published hotel-facing product, but it gives up or materially changes the native checkout.

## Current DEVOCEAN baseline

### Beds24 responsibilities

Beds24 currently provides:

- Authoritative room and property configuration
- Live availability and units available
- Occupancy-aware room offers and rate plans
- Restrictions and date-dependent pricing
- Deposit and cancellation policy inputs
- A long-range price calendar
- Final reservation creation after payment
- Booking identifiers used for reconciliation
- OTA reservation notifications, modifications, and cancellations

The application deliberately treats Beds24 as the sole inventory authority. Browser-supplied prices are never trusted.

### Native booking safety model

The current booking flow is:

1. The website requests live Beds24 availability through the automailer API.
2. The guest selects rooms and rate plans.
3. The server recomputes the cart from fresh Beds24 data.
4. A pending local booking is created.
5. Stripe Checkout collects the required deposit.
6. A signature-verified Stripe webhook recomputes availability and pricing.
7. The server creates the Beds24 booking.
8. A sold-out result triggers an automatic Stripe refund.
9. A successful reservation schedules guest emails and sends GA4 purchase attribution.

Any replacement must preserve the same trust boundary or explicitly replace it with an equally safe SiteMinder-owned checkout.

### Downstream dependencies

The automailer parses Beds24 notification emails for OTA bookings, modifications, and cancellations. Native direct bookings bypass that email parser and are registered directly after the Beds24 API write.

Marin does not call Beds24 independently. It calls the automailer's `/api/booking/availability` endpoint so the receptionist and booking page always quote the same price.

This existing boundary is useful: a new booking provider can be introduced behind the automailer contract without rewriting Marin and the website first.

## SiteMinder product and API fit

### Hotel-facing Direct Booking API

The Direct Booking API is the closest match for the DEVOCEAN website.

Official eligibility:

- Individual properties must use the current **SiteMinder Platform**.
- The property must use SiteMinder **Direct Booking**.
- Properties on the classic SiteMinder Channel Manager cannot access this API.
- A property-level key is generated under `Direct Booking → Configuration → API Integration`.
- Requests use `x-sm-api-key`.
- The key is server-side only and must not be exposed in the browser.
- The documented rate limit is 100 calls per minute per key.
- Availability should not be cached for extended periods.

Documented operations:

- Get one or more properties
- Get room types
- Get room rates
- Get quotes containing availability and pricing
- Request an optional daily price breakdown
- Apply a promo code to a quote

Documented quote constraints and fields:

- Maximum stay query of 31 nights
- Adults, children, and infants
- Availability count
- Gross, net, tax, and service-charge values
- Optional daily breakdown and discounts

The API overview does **not** publish reservation mutation endpoints. SiteMinder's own documentation query could not confirm that an individual property can create, modify, or cancel a reservation after completing an independent Stripe checkout.

### Partner APIs

| API | Intended user | Relevant capability | Fit for DEVOCEAN |
|---|---|---|---|
| Direct Booking API | SiteMinder properties and hotel groups | Property, rooms, rates, availability, quotes | Strong read-side fit; no documented reservation write |
| SiteConnect | Booking channels, OTAs, wholesalers | Receives ARI and submits reservation lifecycle events | Not a normal hotel/property integration |
| Channels Plus | Booking and distribution partners | Search and sell opted-in SiteMinder properties at scale | Not appropriate for one property's own website |
| pmsXchange | PMS, RMS, and CRS providers | Two-way ARI plus reservations, modifications, cancellations | Relevant only if DEVOCEAN becomes an approved PMS-style partner |
| SMX | Hotel applications and RMS providers | Receives reservations and guest-status events | Could replace email ingestion, but requires app-partner access |

### Product features outside the API

SiteMinder's commercial platform advertises:

- Channel Manager
- Direct Booking engine
- SiteMinder Payments
- Reservation management
- Revenue and market insights
- Hotel App Store integrations

Availability, pricing, channel coverage, payment countries, transaction fees, onboarding, data migration, and API access are plan- and contract-dependent. These must be confirmed in a SiteMinder proposal rather than inferred from public marketing pages.

## Capability matrix

| Capability | Current Beds24 implementation | SiteMinder evidence | Replacement assessment |
|---|---|---|---|
| Room inventory | Beds24 property and room records | SiteMinder platform plus room-type API | Supported |
| Rates and rate plans | Live Beds24 offers and configured policies | Room Rates and Quotes endpoints | Supported, mapping required |
| Availability | Beds24 offers and units available | Quotes return availability | Supported |
| Restrictions | Enforced through Beds24 offers and availability | SiteMinder platform manages restrictions; quote output reflects bookability | Supported operationally; field-level parity must be tested |
| Occupancy pricing | Per-leg adults, children, and infants | Quote parameters include adults, children, and infants | Likely supported; child-age policy and multi-unit parity require tests |
| Promotions | Local discount and gift-voucher logic plus Beds24 rates | Quote endpoint accepts a promo code | Promo codes supported; local gift vouchers are not proven |
| Taxes and service charges | Current price returned as the authoritative total | Quote exposes gross, net, tax, and service charge | Better structured, but checkout display and accounting must be mapped |
| Long-range price calendar | Custom endpoint covers the website's navigation horizon | No dedicated calendar endpoint is documented; quotes are limited to 31-night stays | Gap; requires bounded quote aggregation or UI change |
| Multi-room cart | Custom server-side cart with per-leg occupancy and offers | Quote response is per room type/rate | Aggregation is possible; atomic reservation commit is not proven |
| Direct reservation creation | Beds24 REST write after Stripe webhook | No documented Direct Booking API write endpoint | Blocking gap |
| Reservation modification | Beds24/OTA changes arrive through notifications | Available in partner APIs and SiteMinder product UI | No confirmed property-level API |
| Reservation cancellation | Beds24 cancellation notifications update automation | Available in partner APIs and SiteMinder product UI | No confirmed property-level API |
| OTA distribution | Beds24 Channel Manager | Core SiteMinder Channel Manager capability | Supported, channel-by-channel commercial confirmation required |
| OTA booking delivery | Beds24 notification emails parsed every 30 minutes | SiteMinder manages reservations; SMX/pmsXchange can deliver events to partners | Product supports it, but DEVOCEAN's machine-readable feed is not confirmed |
| Direct-booking payment | Stripe deposit with custom policy | SiteMinder offers Direct Booking and Payments | Supported through SiteMinder products; preserving independent Stripe is unconfirmed |
| Sold-out refund guard | Recheck after payment, then automatic Stripe refund | No documented custom payment-to-reservation transaction | Must be redesigned or delegated to SiteMinder checkout |
| Idempotency and reconciliation | Local session state, Stripe IDs, Beds24 booking IDs | Partner APIs have their own delivery rules; Direct Booking write absent | Requires proof before migration |
| Guest automailer | Direct registration plus Beds24 email parser | Could consume a supported reservation event/feed | Requires a new SiteMinder adapter; email-template parsing is not acceptable long term |
| Guest CRM | Local PostgreSQL upsert | Reservation data may contain guest fields | Retain locally; consent and field mapping required |
| Marin availability | Shared automailer availability endpoint | Can remain unchanged behind a provider adapter | Supported if response contract is preserved |
| GA4 purchase attribution | Fired after confirmed booking | SiteMinder tracking capabilities are product/config dependent | Preserve only with confirmed transaction data and deduplication |
| Reporting | Local admin reports plus Beds24 operations | SiteMinder advertises business and revenue insights | Likely gain; exact reports are plan-dependent |
| Agentic booking roadmap | Future write tool assumes current provider can create bookings | No property-level write is documented | Blocked unless SiteMinder grants a supported write path |

## Target architecture options

### Option A: DEVOCEAN UI + Stripe + supported SiteMinder reservation write

**Status:** Preferred but conditional.

```text
Website and Marin
        |
        v
DEVOCEAN booking API
        |
        +-- SiteMinder property/rate/quote reads
        |
        +-- Stripe deposit checkout
        |
        +-- verified Stripe webhook
                |
                +-- fresh SiteMinder quote/availability check
                +-- supported SiteMinder reservation write
                +-- local booking + email scheduling
                +-- GA4 purchase
```

Required proof:

- SiteMinder provides a supported reservation-create operation for the property.
- The same interface supports modification, cancellation, and retrieval.
- It returns durable reservation identifiers.
- It accepts multi-room and occupancy detail.
- It has documented retry and duplicate-prevention semantics.
- SiteMinder permits independent Stripe payment and the property's deposit policy.
- A sandbox or test property supports the whole lifecycle.

If any of these cannot be proven, this option is a no-go.

### Option B: SiteMinder booking engine and payment flow

**Status:** Supported product direction; larger product change.

```text
DEVOCEAN website
        |
        +-- SiteMinder availability/quote display or booking-engine link
        |
        v
SiteMinder Direct Booking + payment
        |
        +-- SiteMinder reservation system
        +-- supported reservation notification/feed
                |
                v
        DEVOCEAN automailer + CRM + analytics
```

Consequences:

- SiteMinder becomes responsible for checkout and reservation atomicity.
- The current Stripe deposit session and webhook booking state are retired for room bookings.
- Gift-voucher checkout can remain on Stripe because it is independent.
- Booking-page UX, supported currencies, deposits, refunds, cancellation policies, and tracking must be revalidated.
- The automailer needs a reliable API or event feed; parsing another vendor's emails should be only a temporary bridge.
- GA4 and Google Ads purchase deduplication must be verified with real SiteMinder transaction IDs.

### Option C: Become a SiteMinder technology partner

**Status:** Not recommended for a single lodge.

This could expose reservation lifecycle APIs through SiteConnect, pmsXchange, or SMX, depending on the product DEVOCEAN represents. It introduces partner contracting, pre-production environments, certification, support obligations, and ongoing compatibility work.

This path makes sense only if DEVOCEAN intends to commercialise its booking/receptionist platform for other properties. It is disproportionate solely to replace Beds24 for one lodge.

## Migration plan

### Stage 0: Commercial and technical gate

Obtain written answers from SiteMinder:

1. Is the proposed account on the current SiteMinder Platform and eligible for Direct Booking API access?
2. Which plan includes the API, Channel Manager, Direct Booking, Payments, and required reports?
3. Can an individual property create, modify, cancel, and retrieve reservations through a supported API?
4. Can those reservations be created after payment through the property's existing Stripe account?
5. If not, what SiteMinder booking-engine and payment flow is required?
6. What machine-readable reservation feed is available to the property for new bookings, modifications, and cancellations?
7. Is SMX access possible for DEVOCEAN's private automailer, or only through app-partner onboarding?
8. Which current DEVOCEAN OTA channels are supported in Mozambique, and what are their activation lead times?
9. What import path exists for future reservations, room/rate mappings, guest data, and payment balances?
10. What export and offboarding facilities are available?

**Exit gate:** Do not build a production adapter until reservation creation and event delivery are contractually and technically clear.

### Stage 1: Sandbox read-side proof

Using a SiteMinder test property:

- Retrieve property, room-type, and room-rate data.
- Map SiteMinder UUIDs to the four DEVOCEAN accommodation types.
- Compare quotes across representative dates and occupancies.
- Verify minimum stays, closed dates, promotions, taxes, service charges, child policy, and inventory counts.
- Test the 100-requests-per-minute limit and retry behaviour.
- Determine a safe replacement for the 730-day price-calendar experience.

No production inventory or booking writes occur in this stage.

### Stage 2: Reservation lifecycle proof

The proof must cover:

- Create one single-room reservation
- Create one multi-room reservation
- Retrieve both by external and SiteMinder identifiers
- Modify dates and guest details
- Cancel and observe inventory restoration
- Repeat requests to prove duplicate prevention
- Simulate timeout after SiteMinder accepts a reservation
- Verify reservation, modification, and cancellation delivery to the automailer
- Verify payment, refund, balance, and failure states

**Exit gate:** No channel or checkout migration without a passed end-to-end lifecycle.

### Stage 3: Provider boundary

Introduce a provider-neutral booking boundary in the automailer while Beds24 remains live:

- Preserve the existing website and Marin API response contracts.
- Map SiteMinder rooms and rates to stable internal identifiers.
- Keep deposit policy, currency, discount, voucher, and display logic explicit.
- Store provider name plus provider reservation and rate identifiers.
- Add event deduplication independent of email subject lines.

Only one provider is enabled for authoritative production reads and writes at a time.

### Stage 4: Shadow comparison

With no SiteMinder writes:

- Compare Beds24 and SiteMinder availability for a fixed set of future dates.
- Compare occupancies, rate plans, totals, taxes, restrictions, and inventory.
- Run comparisons through peak, minimum-stay, sold-out, child, and multi-room cases.
- Alert on differences and resolve mapping/configuration issues.

Suggested observation period: at least 14 days, including OTA changes.

### Stage 5: Data and channel preparation

- Export Beds24 rooms, rates, restrictions, future reservations, channel mappings, and guest/contact data.
- Snapshot all provider identifiers and outstanding balances.
- Import or manually recreate future reservations using SiteMinder's approved process.
- Reconcile every future stay by dates, room, guest, source, value, deposit, and balance.
- Configure OTA channels in SiteMinder without activating conflicting inventory updates.
- Freeze nonessential rate-plan changes during final reconciliation.

Historical booking and guest data can remain in DEVOCEAN PostgreSQL unless SiteMinder requires it operationally.

### Stage 6: Controlled cutover

Recommended order:

1. Pause new direct checkouts briefly and allow active Stripe sessions to expire or complete.
2. Reconcile all pending and processing local booking sessions.
3. Disable Beds24 channel writes.
4. Activate SiteMinder channel mappings in a coordinated window.
5. Switch the authoritative booking provider.
6. Enable the approved direct-booking path.
7. Verify one direct test booking and one reservation delivery event.
8. Monitor channel inventory and duplicate reservations continuously.

Do not dual-write a guest reservation to Beds24 and SiteMinder as a normal migration strategy.

### Stage 7: Stabilisation and retirement

- Keep Beds24 read access during the agreed rollback window.
- Reconcile new bookings daily across SiteMinder, Stripe, and DEVOCEAN PostgreSQL.
- Confirm automailer schedules, cancellations, modifications, CRM updates, and GA4 attribution.
- Retire Beds24 email parsing only after all old future bookings have departed or their lifecycle is safely bridged.
- Remove Beds24 credentials only after rollback is no longer required.

## Acceptance tests

### Availability and pricing

- Each accommodation maps to the correct room and rate plan.
- Availability matches the SiteMinder control panel.
- Adult, child, infant, and multi-room pricing is correct.
- Minimum stay, closed-to-arrival, closed-to-departure, stop-sell, and sold-out states are honoured.
- Promotions, taxes, fees, deposit, balance, and cancellation text match the charged terms.
- Calendar requests cannot exceed provider rate limits or show stale prices.

### Booking and payment

- No reservation exists before the authoritative payment/booking commitment point.
- A successful payment produces exactly one reservation.
- A retry after timeout cannot create a duplicate.
- A sold-out or rejected reservation cannot leave an unexplained captured payment.
- Refund and cancellation states are visible to operations.
- Multi-room partial failure has a defined compensation strategy.

### Operations and messaging

- OTA and direct reservations reach the automailer once.
- Modifications update dates and reschedule messages.
- Cancellations cancel pending messages and produce the intended guest communication.
- Guest email, phone, language, country, postal code, source, and consent-relevant data map correctly.
- Marin and `/book-direct` quote from the same authoritative source.
- GA4 sends one purchase per confirmed booking with the correct value, currency, and transaction ID.

### Migration and rollback

- Every future reservation is reconciled before channel activation.
- No OTA is simultaneously managed by conflicting providers.
- Beds24 can be restored from the cutover snapshot during the rollback window.
- Stripe sessions created before cutover have an explicit drain or reconciliation path.

## Rollback plan

Rollback must be operationally prepared before cutover:

- Retain a full Beds24 export and room/rate/channel mapping snapshot.
- Keep Beds24 credentials and service code intact during stabilisation.
- Record the exact OTA activation/deactivation sequence and contacts.
- Maintain a list of reservations created after the cutover boundary.
- Stop new direct checkouts before switching the provider back.
- Reconcile SiteMinder-created reservations into Beds24 before restoring channel writes.
- Never restore Beds24 channel writes while SiteMinder is still distributing the same inventory.

Rollback is not instantaneous because OTA channel ownership must be coordinated. The cutover should therefore be scheduled with SiteMinder onboarding support and a low-traffic operational window.

## Effort estimate

These estimates exclude SiteMinder contracting, vendor response time, and OTA activation lead times.

| Work | Estimated engineering effort |
|---|---:|
| Vendor/API validation and detailed mapping | 3–5 days |
| Sandbox read-side adapter and parity tests | 5–8 days |
| Option A reservation lifecycle and Stripe integration | 10–20 days, only if supported |
| Option B hosted booking-engine integration | 5–10 days |
| Automailer event adapter and reconciliation | 7–12 days |
| Marin/provider-neutral compatibility | 2–4 days |
| Data migration tooling and cutover checks | 5–10 days |
| Stabilisation and fixes | 5–10 days |

Indicative total:

- **Option A:** 6–10 engineering weeks after supported write access is confirmed.
- **Option B:** 4–7 engineering weeks, depending on reservation-feed and analytics support.
- **Partner API route:** Not meaningfully estimable until SiteMinder accepts the partnership; likely months of calendar time.

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| No property-level reservation write | Critical | Written SiteMinder confirmation before implementation |
| Duplicate reservations during cutover | Critical | One writer, drained Stripe sessions, coordinated OTA switch |
| Payment captured without reservation | Critical | Preserve webhook compensation or delegate checkout to SiteMinder |
| Automailer loses OTA events | High | Prove supported event/feed delivery before retiring Beds24 parsing |
| Pricing or restriction mismatch | High | Shadow parity suite across dates and occupancies |
| Gift vouchers or local discounts no longer apply | High | Confirm hosted-engine support or retain custom path |
| Long-range calendar exceeds API limits | Medium | Bounded aggregation, caching, or simplified calendar UI |
| GA4/Google Ads attribution duplicates | Medium | One transaction ID and one authoritative purchase emitter |
| Vendor lock-in and difficult rollback | Medium | Retain local booking/guest records and scheduled exports |
| Partner certification delays | High | Avoid partner-only APIs unless DEVOCEAN becomes a product vendor |

## Go/no-go recommendation

### Immediate production replacement: No-go

The public SiteMinder property API does not document the reservation-write lifecycle needed by the existing Stripe flow. Replacing Beds24 before resolving that gap would risk captured payments without reservations, duplicate writes, broken cancellations, and lost automailer events.

### Vendor and sandbox validation: Go

Proceed with SiteMinder commercial discussions and a non-production proof if:

- DEVOCEAN is offered the current SiteMinder Platform with Direct Booking API access.
- SiteMinder answers the reservation-write and machine-readable event-feed questions in writing.
- A test property is available.

### Preferred final decision

- Choose **Option A** if SiteMinder provides a supported property-level reservation lifecycle compatible with the existing Stripe design.
- Choose **Option B** if SiteMinder does not provide that lifecycle and the operational benefits justify adopting its booking engine and payment experience.
- Remain on Beds24 if retaining the native checkout, Stripe deposit workflow, automailer control, and future agentic booking are more valuable than SiteMinder's distribution and reporting gains.

## Questions to send SiteMinder

Use this concise request with SiteMinder sales or integration support:

> DEVOCEAN Lodge is considering replacing Beds24 with the current SiteMinder Platform. We operate one property and have a custom direct-booking website. Our server retrieves live availability and prices, collects a deposit through our own Stripe Checkout, rechecks inventory after the signed Stripe webhook, and then creates the confirmed reservation. We also need machine-readable new-reservation, modification, and cancellation events for our guest-email system.
>
> Please confirm:
>
> 1. Which SiteMinder plan gives an individual property access to the Direct Booking API?
> 2. Is there a supported property-level API to create, retrieve, modify, and cancel a reservation after payment through our own Stripe account?
> 3. If this requires a partner API, which programme applies and what onboarding/certification is required?
> 4. If custom reservation creation is unavailable, must checkout use SiteMinder Direct Booking and SiteMinder Payments?
> 5. Which webhook, push, or polling interface can our private automailer use for reservations, modifications, and cancellations?
> 6. Can you provide a sandbox/test property for an end-to-end proof?
> 7. What import path is available for existing future reservations and outstanding balances?

## Official sources

Accessed 4 September 2026:

- [SiteMinder Developer Guide](https://www.siteminder.com/developer-guide/)
- [SiteMinder APIs](https://developer.siteminder.com/get-started/siteminder-apis)
- [Property / Hotel Group integration type](https://developer.siteminder.com/get-started/integration-types/property-hotel-group)
- [Direct Booking API](https://developer.siteminder.com/direct-booking-api/direct-booking-api)
- [Direct Booking integration requirements](https://developer.siteminder.com/direct-booking-api/guides/integration-requirements)
- [Direct Booking API overview](https://developer.siteminder.com/direct-booking-api/guides/api-overview)
- [Direct Booking Quotes](https://developer.siteminder.com/direct-booking-api/reference/quotes)
- [pmsXchange](https://developer.siteminder.com/pmsxchange-api/pmsxchange-api)
- [SMX](https://developer.siteminder.com/smx-api/smx-api)
- [Partner integration process](https://developer.siteminder.com/get-started/partner-lifecycle/integration-process)
