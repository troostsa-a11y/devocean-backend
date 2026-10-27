---
name: Public inquiry quota authority
description: Why public form email admission uses the existing backend database rather than edge-local state.
---
Keep inquiry send admission shared and durable across forms and edge locations.
Reuse the existing authenticated automailer/database rather than introducing
another Cloudflare service solely for quotas. An unavailable quota authority must
not allow unchecked sends.

**Why:** CAPTCHA does not constrain successful submission volume. Per-isolate
memory and eventually consistent counters cannot reliably cap sends across edge
locations; backend-local memory also loses limits on restarts or replica changes.
The existing backend provides a shared transactional authority without new
credentials or infrastructure.

**How to apply:** Deploy backend quota support before edge enforcement. If an
older backend is still running, keep the explicit temporary-unavailable response
rather than falling back to unlimited sends. Count partial or uncertain sends
against the quota because a provider timeout does not prove delivery failed.
