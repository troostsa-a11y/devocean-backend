---
name: Gift voucher payment verification
description: Distinguish checkouts from payments and preserve existing bookings when hardening historical voucher credit.
---
An unpaid voucher checkout is not evidence of a payment attempt. It may have no
entry in Stripe's Payments list because the visitor never submitted payment.

**Why:** A historical pending voucher was mistaken for a pending payment. The
absence of a Payments-list entry cannot rule out a lost payment notification.

**How to apply:** Reconcile against the Stripe Checkout session, not elapsed time
or a Payments-list search. Preserve an unverified status on lookup failures.
Only issue value after trusted Stripe evidence confirms payment, amount, currency
and the matching voucher. Do not manually activate or delete historical records
just to clear the admin list.

Historical voucher-use corrections must not automatically re-price or cancel
already-confirmed bookings.

**Why:** Older records can describe credit as active even though a stay already
used it. Preventing another spend is necessary; changing the commitments or
payments of those existing guests is a separate operational decision.

**How to apply:** Count fulfilled or partially-created stays as spent credit for
new booking attempts. Leave historical cancellations, extra charges and financial
reconciliation to explicit operator review.

Checkout abuse limits must aggregate across the public site's edge instances.
The single-process automailer can use bounded in-memory counters without adding
a CAPTCHA or a new infrastructure dependency.

**Why:** The costly actions happen before payment, and isolate-local counters
would let an attacker multiply their allowance by reaching different edge
instances. Backend memory is a minimal patch, not a durable distributed quota.

**How to apply:** If the automailer is scaled to multiple processes, or limits
must survive restarts, move counters to shared storage. Do not move the only
limiter to Pages or trust a visitor-supplied identity header at the public proxy.