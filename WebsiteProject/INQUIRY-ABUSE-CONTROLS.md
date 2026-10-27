# Public inquiry send quotas

Both production Pages handlers (`/api/contact` and `/api/experience-inquiry`)
reserve quota after CAPTCHA and input validation, before either outbound email.
They use the existing authenticated automailer backend and lodge PostgreSQL
database, not edge-local memory or eventually consistent KV counters.

## Shared limits

Each accepted submission reserves one send pair (primary message and guest reply):

- Client IP: 3 submissions per 15 minutes.
- Guest email: 3 submissions per hour, case-insensitive, across both forms.
- Experience operator email: 20 submissions per hour.
- Both forms together: 60 submissions per hour and 200 per day.

Windows begin on first admission and expire independently. A transactional
database lock makes admission atomic across backend replicas. Expired counters
are removed during admission; identity keys are SHA-256 hashes. Failed or partial
email sends retain reservations to prevent retry-driven email amplification.

Exhaustion returns JSON HTTP 429 with `Retry-After`. Missing configuration,
backend timeout, or database failure returns JSON HTTP 503 and sends no email.
CAPTCHA and the operator allowlist remain required.

## Rollout

Deploy the updated automailer **before** the updated Pages code. No new
credentials or Cloudflare bindings are needed: Pages already uses
`AUTOMAILER_URL` and `ADMIN_API_KEY`. The backend initializes its
`public_inquiry_quotas` table idempotently on first reservation, following its
existing table-initialization convention. Its database user must have CREATE
TABLE permission, as required for the existing backend tables.

If Pages is updated while the backend is still old, inquiry submissions return
503 without sending. Deploying the backend restores submissions; do not bypass
the quota check to recover availability.

Local `WebsiteProject/server.js` contains separate development form handlers;
the production security boundary is the Pages Functions tested here.
