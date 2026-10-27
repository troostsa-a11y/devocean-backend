---
name: Mailbox safety policy
description: Operational tradeoffs when limiting booking-email ingestion
---

Oversized or invalid-size messages should be skipped without deleting them or
marking them read solely because they exceed ingestion limits.

**Why:** A legitimate booking notification can include an unusually large
attachment. Resource protection must not silently hide that notification from
the operator. Leaving it unread is safe only when scanning can advance past it.

**How to apply:** Keep size rejection before body downloads, preserve the
operator's ability to inspect excluded mail, and test that an oversized backlog
does not prevent subsequent mailbox entries from being considered.

Bounded historical scanning must also inspect recent arrivals.

**Why:** Scanning only a small oldest-first window per scheduled check can delay
new bookings for days in a mailbox containing a large read-mail history.

**How to apply:** Preserve a bounded recent-arrival check alongside backlog
progress when adjusting mailbox ingestion, without restoring an unbounded
unread-message fetch.

Reserve historical capacity independently of recent-mail read status.

**Why:** Ordinary non-booking mail is intentionally left unread. If the recent
window can consume the entire batch on every check, these persistent messages
can indefinitely prevent the historical cursor reaching older bookings.

**How to apply:** Reserve message-count, byte, and time budgets for historical
progress, and test successive checks without marking recent ordinary mail read.
