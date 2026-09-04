# SiteMinder as a Beds24 Replacement

**Assessment date:** 4 September 2026  
**Decision:** Pursue DEVOCEAN as the PMS/reservation system of record, with SiteMinder as the channel-distribution layer through pmsXchange. Production remains conditional on partner approval and certification.

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

The exploration clarified that SiteMinder does not need to create DEVOCEAN's own direct reservations. Instead, DEVOCEAN can expand into the PMS and reservation system of record:

1. DEVOCEAN creates and hosts reservations from its own Stripe checkout.
2. DEVOCEAN sends availability, rates, and restrictions to SiteMinder.
3. SiteMinder distributes that inventory to connected channels.
4. SiteMinder pushes channel- and SiteMinder-originated reservations, modifications, and cancellations into DEVOCEAN.

That flow is the role of **pmsXchange**, not the property-level Direct Booking API. It requires DEVOCEAN to be accepted and certified as a PMS integration partner.

A reservation pushed by SiteMinder must not automatically be treated as fully paid. Confirmation status and payment status are separate. Depending on the source, payment may be handled by SiteMinder Payments, an OTA, an OTA virtual card, the property, or DEVOCEAN's Stripe account.

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
| Direct reservation creation | Beds24 REST write after Stripe webhook | DEVOCEAN can create its own direct reservations locally | Supported in the target PMS architecture; no SiteMinder round trip required |
| Reservation modification | Beds24/OTA changes arrive through notifications | pmsXchange pushes reservation changes to PMS partners | Supported conditionally through partner integration |
| Reservation cancellation | Beds24 cancellation notifications update automation | pmsXchange pushes cancellations to PMS partners | Supported conditionally through partner integration |
| OTA distribution | Beds24 Channel Manager | Core SiteMinder Channel Manager capability | Supported, channel-by-channel commercial confirmation required |
| OTA booking delivery | Beds24 notification emails parsed every 30 minutes | pmsXchange pushes reservations into an approved PMS | Target integration; requires approval, certification, and delivery tests |
| Direct-booking payment | Stripe deposit with custom policy | DEVOCEAN remains payment authority for its own direct bookings | Preserved |
| SiteMinder/OTA payment | Parsed indirectly from booking notifications | Payment responsibility varies by channel, SiteMinder Payments, virtual card, or property collect | Must be stored separately from reservation confirmation |
| Sold-out refund guard | Recheck after payment, then automatic Stripe refund | DEVOCEAN owns direct inventory and reservation transaction | Preserve locally; then publish updated inventory to SiteMinder |
| Idempotency and reconciliation | Local session state, Stripe IDs, Beds24 booking IDs | pmsXchange delivery and acknowledgement rules apply | Must be implemented and certified |
| Guest automailer | Direct registration plus Beds24 email parser | Could consume a supported reservation event/feed | Requires a new SiteMinder adapter; email-template parsing is not acceptable long term |
| Guest CRM | Local PostgreSQL upsert | Reservation data may contain guest fields | Retain locally; consent and field mapping required |
| Marin availability | Shared automailer availability endpoint | Can remain unchanged behind a provider adapter | Supported if response contract is preserved |
| GA4 purchase attribution | Fired after confirmed booking | SiteMinder tracking capabilities are product/config dependent | Preserve only with confirmed transaction data and deduplication |
| Reporting | Local admin reports plus Beds24 operations | SiteMinder advertises business and revenue insights | Likely gain; exact reports are plan-dependent |
| Agentic booking roadmap | Future write tool assumes current provider can create bookings | DEVOCEAN becomes the reservation writer | Unblocked by SiteMinder once local inventory and reservation rules are authoritative |

## Target architecture options

### Target: DEVOCEAN PMS + SiteMinder pmsXchange

**Status:** Chosen direction; conditional on SiteMinder partner approval and certification.

```text
DEVOCEAN website + Marin
          |
          +-- Stripe deposit
          +-- local reservation creation
          +-- automailer, CRM and GA4
          |
          v
DEVOCEAN reservation database (system of record)
          |
          +-- availability, rates and restrictions -->
          |                 pmsXchange
          |                      |
          |                      v
          |                  SiteMinder --> OTAs
          |                      |
          <-- reservations, modifications and cancellations
```

Responsibilities:

- DEVOCEAN owns reservation records, direct-booking checkout, Stripe payment state, guest messaging, CRM data, and analytics.
- SiteMinder owns channel connectivity and distributes the inventory supplied by DEVOCEAN.
- pmsXchange carries availability, rates, and restrictions from DEVOCEAN to SiteMinder.
- pmsXchange carries channel reservations, modifications, and cancellations from SiteMinder to DEVOCEAN.
- DEVOCEAN acknowledges incoming messages idempotently and provides reconciliation for failures.

Required proof:

- SiteMinder accepts DEVOCEAN as a pmsXchange PMS partner.
- The certification scope covers the required channels, inventory, rates, restrictions, reservations, modifications, and cancellations.
- Reservation messages expose the identifiers, guest data, occupancy, pricing, taxes, source, guarantee, and payment responsibility DEVOCEAN requires.
- Retry, acknowledgement, sequencing, duplicate-prevention, and outage recovery semantics are documented.
- A sandbox proves the complete two-way lifecycle.

### Alternative: SiteMinder booking engine and payment flow

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

### Rejected approach: transparent Direct Booking API swap

The property-level Direct Booking API cannot be treated as a drop-in Beds24 replacement because it does not document reservation mutation. It may still be useful for read-side quote comparison, but it is not the foundation of the chosen reservation architecture.

## Migration plan

### Stage 0: Commercial and technical gate

Obtain written answers from SiteMinder:

1. Will SiteMinder accept DEVOCEAN as a PMS integration through pmsXchange?
2. What commercial agreement, onboarding, sandbox, test suite, and certification are required?
3. Can pmsXchange push new reservations, modifications, and cancellations from all required channels into DEVOCEAN?
4. Which payment-status, guarantee, virtual-card, deposit, balance, and payment-responsibility fields are delivered?
5. Can DEVOCEAN publish availability, rates, and restrictions as the authoritative PMS?
6. Which current DEVOCEAN OTA channels are supported in Mozambique, and what are their activation lead times?
7. Can SiteMinder Direct Booking reservations also be delivered through pmsXchange?
8. What availability and reservation reconciliation interfaces are available after outages?
9. What import path exists for future reservations, room/rate mappings, guest data, and payment balances?
10. What export and offboarding facilities are available?

**Exit gate:** Do not build a production adapter until PMS-partner eligibility, reservation delivery, ARI publishing, payment semantics, and certification are confirmed.

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

- Push one single-room and one multi-room test reservation from SiteMinder into DEVOCEAN
- Store both by SiteMinder, channel, and DEVOCEAN identifiers
- Deliver modified dates and guest details into DEVOCEAN
- Deliver cancellations and observe inventory restoration
- Repeat messages to prove duplicate prevention
- Simulate acknowledgement and delivery timeouts
- Publish DEVOCEAN availability, rates, and restrictions back to SiteMinder
- Verify reservation, modification, and cancellation delivery to the automailer
- Verify payment responsibility, deposit, refund, balance, virtual-card, and failure states without assuming that confirmation means paid

**Exit gate:** No channel or checkout migration without a passed end-to-end lifecycle.

### Stage 3: PMS boundary

Establish DEVOCEAN as the authoritative reservation boundary while Beds24 remains live:

- Preserve the existing website and Marin API response contracts.
- Map SiteMinder rooms and rates to stable internal identifiers.
- Keep deposit policy, currency, discount, voucher, and display logic explicit.
- Store provider name plus provider reservation and rate identifiers.
- Add event deduplication independent of email subject lines.
- Model reservation confirmation, payment status, payment responsibility, and balance separately.
- Add an outbound availability, rates, and restrictions queue with retry and reconciliation.

Only one channel manager may distribute authoritative production inventory at a time. DEVOCEAN remains the reservation system of record after cutover.

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
5. Switch channel distribution authority to SiteMinder while keeping DEVOCEAN authoritative for reservations.
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
| DEVOCEAN reservation-domain expansion | 10–20 days |
| pmsXchange inbound reservation adapter | 10–20 days |
| pmsXchange outbound ARI publishing and reconciliation | 10–20 days |
| Alternative hosted booking-engine integration | 5–10 days |
| Automailer event adapter and reconciliation | 7–12 days |
| Marin/provider-neutral compatibility | 2–4 days |
| Data migration tooling and cutover checks | 5–10 days |
| Stabilisation and fixes | 5–10 days |

Indicative total:

- **Chosen PMS/pmsXchange direction:** approximately 10–16 engineering weeks after SiteMinder supplies the specification and sandbox.
- **Alternative hosted booking engine:** approximately 4–7 engineering weeks, depending on reservation-feed and analytics support.
- **Partner onboarding:** Not meaningfully estimable until SiteMinder accepts the partnership; certification may add months of calendar time.

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| DEVOCEAN is not accepted as a pmsXchange partner | Critical | Obtain written eligibility before implementation |
| Duplicate reservations during cutover | Critical | One writer, drained Stripe sessions, coordinated OTA switch |
| Payment captured without reservation | Critical | Preserve webhook compensation or delegate checkout to SiteMinder |
| Automailer loses OTA events | High | Prove supported event/feed delivery before retiring Beds24 parsing |
| Confirmed reservation is incorrectly treated as paid | Critical | Separate reservation and payment states; certify source-specific payment mapping |
| ARI updates fail or arrive out of order | Critical | Durable queue, idempotency, retries, monitoring, and reconciliation |
| Pricing or restriction mismatch | High | Shadow parity suite across dates and occupancies |
| Gift vouchers or local discounts no longer apply | High | Confirm hosted-engine support or retain custom path |
| Long-range calendar exceeds API limits | Medium | Bounded aggregation, caching, or simplified calendar UI |
| GA4/Google Ads attribution duplicates | Medium | One transaction ID and one authoritative purchase emitter |
| Vendor lock-in and difficult rollback | Medium | Retain local booking/guest records and scheduled exports |
| Partner certification delays | High | Treat certification as a programme dependency, not an engineering estimate |

## Go/no-go recommendation

### Architectural direction: Go

Expanding DEVOCEAN into the reservation system of record resolves the main Direct Booking API limitation. DEVOCEAN does not need SiteMinder to create reservations originating from its own Stripe checkout. It creates them locally and publishes the resulting inventory through the PMS integration.

### Immediate production replacement: No-go

Production replacement remains premature until SiteMinder accepts the pmsXchange partnership and the two-way interface passes certification. The principal risks are now reservation-delivery reliability, inventory synchronisation, payment interpretation, and channel cutover rather than the absence of a property-level reservation-write endpoint.

### Vendor and sandbox validation: Go

Proceed with SiteMinder commercial discussions and a non-production proof if:

- SiteMinder confirms DEVOCEAN's eligibility as a pmsXchange PMS integration.
- SiteMinder defines the payment and reservation fields available for each booking source.
- A pmsXchange test property and certification environment are available.

### Preferred final decision

- Build DEVOCEAN as the PMS and reservation system of record.
- Pursue pmsXchange certification so SiteMinder can push channel reservations into DEVOCEAN and receive authoritative availability, rates, and restrictions.
- Keep the existing Stripe flow for DEVOCEAN-originated bookings.
- Treat payment status independently from reservation confirmation for SiteMinder- and OTA-originated bookings.
- Use SiteMinder's hosted booking engine only as an alternative if PMS-partner access is declined or becomes disproportionate.

## Questions to send SiteMinder

Use this concise request with SiteMinder sales or integration support:

> DEVOCEAN is expanding its application into the PMS and reservation system of record for DEVOCEAN Lodge. The app will create and host reservations originating from its own Stripe checkout, manage guest messaging and payment state, and publish authoritative availability, rates, and restrictions. We want SiteMinder to provide channel distribution and push SiteMinder- and OTA-originated reservations, modifications, and cancellations into DEVOCEAN through pmsXchange.
>
> Please confirm:
>
> 1. Can DEVOCEAN apply as a pmsXchange PMS integration partner for one initial property?
> 2. What commercial, sandbox, testing, and certification requirements apply?
> 3. Can SiteMinder push new reservations, modifications, and cancellations from connected OTAs and SiteMinder Direct Booking into DEVOCEAN?
> 4. Which payment-status, guarantee, deposit, balance, virtual-card, and payment-responsibility fields are supplied for each booking source?
> 5. Can DEVOCEAN publish authoritative availability, rates, and restrictions to SiteMinder?
> 6. What acknowledgements, retries, duplicate-prevention, sequencing, and reconciliation requirements must DEVOCEAN implement?
> 7. Can you provide a pmsXchange sandbox/test property and certification specification?

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
