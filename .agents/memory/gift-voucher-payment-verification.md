---
name: Gift voucher payment verification
description: Distinguish checkout attempts from payments and handle historical pending records safely.
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