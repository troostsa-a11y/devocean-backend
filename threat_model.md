# Threat Model

## Project Overview

DEVOCEAN Lodge has two production-facing parts:

- A public marketing website built in `WebsiteProject/` and deployed through Cloudflare Pages.
- A Node/Express email automation service in `render-automailer/` that reads booking emails from an IMAP inbox, stores booking and guest data in PostgreSQL, and sends transactional guest emails.

The system handles guest contact details, booking references, stay dates, email content, unsubscribe tokens, and secrets for IMAP, SMTP, Resend, and the database. Only production-reachable behavior is in scope. Based on the repo layout and startup scripts, local preview helpers such as `start.js` and the website preview server are usually dev-only unless a production route clearly points to them.

## Assets

- **Guest booking data** — names, email addresses, phone numbers, booking references, dates, language, and booking status. This data drives guest communications and lodge operations.
- **Guest communication channels** — the ability to send emails from lodge-controlled addresses and to schedule or cancel those emails. Abuse here can harm guests and the lodge’s reputation.
- **Automation state in PostgreSQL** — bookings, scheduled emails, email logs, and pending cancellations. Tampering here can stop, duplicate, or falsify guest messaging.
- **Application secrets** — `DATABASE_URL`, IMAP/SMTP credentials, Resend API key, and `ADMIN_API_KEY`. Leakage would allow broad service compromise.
- **Operational availability** — the IMAP inbox, outbound email quota, and database capacity. Public endpoints that trigger expensive work can degrade service.

## Trust Boundaries

- **Browser to Cloudflare Pages Functions** — all website form input is untrusted. The serverless handlers must not trust client-selected recipients, client-side validation, or browser-only controls.
- **Public internet to Express automation API** — all HTTP requests to the automation service are untrusted unless authenticated server-side.
- **IMAP inbox to automation parser** — inbound email content is untrusted until the sender and message authenticity are verified. Treating mailbox contents as authoritative creates a high-risk service-to-service trust boundary.
- **Automation service to IMAP server** — the IMAP connection itself is security-critical. TLS certificate validation is required because a forged mail server can steal mailbox credentials and feed the parser attacker-chosen messages.
- **Automation service to PostgreSQL** — the service can create, update, cancel, and delete booking records and scheduled emails.
- **Automation service to outbound email providers** — the service can send guest and operator emails using trusted lodge identities.
- **Public vs admin operations** — public website forms are intentionally open; booking-management and manual automation actions must stay behind explicit server-side authorization. Admin secrets such as `ADMIN_API_KEY` must not be sent in URLs because URL-bearing systems commonly replicate them into logs, browser history, and support tooling.
- **Server-side export to operator desktop** — guest names, email addresses, and other booking-derived fields remain untrusted when exported for staff use. CSV and spreadsheet exports must neutralize formula interpretation because opening an export is a normal admin workflow.

## Scan Anchors

- **Production entry points:** `WebsiteProject/functions/api/contact.js`, `WebsiteProject/functions/api/experience-inquiry.js`, `render-automailer/server.ts`.
- **Highest-risk code areas:** `render-automailer/server/services/email-automation.ts`, `email-parser.ts`, `cancellation-handler.ts`, `modification-handler.ts`.
- **Public surfaces:** website forms and any unauthenticated Express routes such as `/health` and `/`.
- **Admin boundary:** `render-automailer/server.ts` routes protected by `requireAdminKey`, especially `/api/admin/guests/export/google` and the `/admin` browser flow in `WebsiteProject/src/components/AdminPage.jsx`.
- **Inbound transport anchor:** `render-automailer/server/services/email-parser.ts` IMAP connection settings.
- **Usually dev-only unless proven otherwise:** preview/startup helpers such as `start.js`, local website preview server code, archived scripts, and mockup sandbox paths.

## Threat Categories

### Spoofing

This project accepts data from two high-risk external sources: public website forms and booking-notification emails. The system must verify who is allowed to trigger sensitive actions. Public form handlers must derive sensitive routing choices from trusted server-side data rather than from client input. Booking automation must verify that inbound messages actually come from the expected booking provider before treating them as cancellations, modifications, or new bookings, and it must authenticate the IMAP server itself with normal TLS certificate validation.

### Tampering

The automation service can cancel bookings, delete existing automation records, and reschedule guest emails. Those state-changing actions must only happen from authenticated admin calls or from trusted, verified provider notifications. Client-side selections and plain-text email contents are not trustworthy enough on their own.

### Information Disclosure

The system stores guest PII and operational data. Responses, logs, admin routes, and export workflows must avoid leaking guest details, secrets, or internal service behavior to the public. Public endpoints should return only the minimum needed result, and admin operations must remain server-side protected. Secrets should not be placed in query strings, and spreadsheet exports should treat booking-derived text as untrusted content.

### Denial of Service

The automation service performs expensive work: IMAP connections, parsing large email bodies, database updates, and outbound scheduling. Any public endpoint that can trigger that workflow must be authenticated and ideally rate-limited. Public forms must also rely on server-side abuse controls because non-browser clients can bypass browser-only restrictions.

### Elevation of Privilege

The main privilege boundary is between the public internet and booking-management capabilities. Only authenticated admin requests should create, modify, cancel, or manually trigger booking automation. The website must not let a public user turn a normal inquiry form into an arbitrary outbound mail-sending feature by editing client-submitted fields, and admin credentials must stay out of URLs so they cannot be passively copied into logs and browser artifacts.
