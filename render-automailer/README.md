# DEVOCEAN Lodge Email Automation Service

Standalone email automation service for processing Beds24 booking notifications.

## Deployment to Render

### 1. Create a New Background Worker

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **Background Worker**
3. Connect your repository or upload this folder
4. Configure:
   - **Name**: `devocean-automailer`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Starter ($7/month)

### 2. Add Environment Variables

In the Render dashboard, go to **Environment** and add:

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `LODGE_DATABASE_URL` | Lodge Supabase project connection string (eu-west-1, ref fozgrzqwumnynpedpmth) | `postgresql://postgres.fozgrzqwumnynpedpmth:pass@aws-1-eu-west-1.pooler.supabase.com:5432/postgres` |
| `MAIL_HOST` | SMTP/IMAP server hostname | `vm02-murphy.h4ahosting.com` |
| `IMAP_USER` | Email account username | `reservations@devoceanlodge.com` |
| `IMAP_PASSWORD` | Email account password | `your-password` |

#### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MAIL_PORT` | `465` | SMTP port (not used, legacy) |
| `SMTP_PORT` | `465` | SMTP port for sending |
| `IMAP_HOST` | Same as MAIL_HOST | IMAP server (if different from SMTP) |
| `IMAP_PORT` | `993` | IMAP port |
| `IMAP_TLS` | `ssl` | Implicit TLS enabled by default (`ssl` or `true`); only explicit `false` disables it |
| `IMAP_FROM_EMAIL` | `booking@devoceanlodge.com` | Sender email address |
| `IMAP_FROM_NAME` | `DEVOCEAN Lodge Bookings` | Sender display name |
| `ADMIN_EMAIL` | `admin@devoceanlodge.com` | Admin report recipient |
| `BCC_EMAIL` | `beds24@devoceanlodge.com` | BCC for all guest emails |
| `TAXI_EMAIL` | - | Taxi company notification email |
| `TAXI_WHATSAPP` | - | Taxi company WhatsApp number |
| `TAXI_NAME` | `Taxi Company` | Taxi company name |

TLS remains enabled when `IMAP_TLS` is unset, blank, or unrecognized. Values are
case-insensitive and surrounding whitespace is ignored. Certificate validation
uses Node's secure defaults. Do not use `IMAP_TLS=false` on an untrusted network:
it disables implicit TLS and may expose mailbox credentials and booking messages.
The default port `993` requires implicit TLS; changing `IMAP_PORT` alone does not
disable TLS.

### 3. Deploy

Click **Create Background Worker**. Render will:
1. Install dependencies
2. Start the service
3. Keep it running 24/7

## How It Works

The service runs continuously and:

1. **Email Checks** (every 30 min at :00 and :30)
   - Connects to IMAP server
   - Fetches unread Beds24 booking emails
   - Parses new bookings, modifications, cancellations
   - Stores in Supabase database
   - Schedules automated guest emails

2. **Email Sending** (every 30 min at :15 and :45)
   - Sends pending scheduled emails
   - Post-booking confirmation
   - Pre-arrival (7 days before)
   - Arrival day (2 days before)
   - Post-departure (1 day after)

3. **Reports**
   - Daily report at 14:00 CAT (12:00 UTC)
   - Weekly report at 08:00 CAT Monday

## Mailbox ingestion limits

Each email check scans at most 200 mailbox entries (metadata only), downloads at
most 25 unread messages, and retains at most 8 MiB of raw mail. Each full RFC822
message, including attachments, must fit within 2 MiB. A stream byte counter
enforces this even if the server reports an incorrect message size. Each FETCH
has a 15-second deadline; a batch stops starting new downloads after 60 seconds.
Manual and scheduled checks cannot overlap.

The scan checks the 100 most recent messages and advances a separate 100-message
window through the mailbox, wrapping at the end. A backlog is processed over
multiple checks without waiting through read-mail history for recent arrivals.
The recent window can use at most 12 downloads, 4 MiB, and half the batch's
download-start time budget; the remaining capacity is reserved for the rotating
historical window. This ensures ordinary messages left unread cannot monopolize
the batch. The historical scan includes recent entries too, so every mailbox
entry is eventually considered even if recent mail stays unread.
Oversized or invalid-size messages are logged
and skipped without downloading their bodies or changing their read status.
Operators should inspect skipped messages in the mailbox. The cursor resets
after a process restart or mailbox UIDVALIDITY change; unprocessed messages stay
unread and are not deleted. Sender authentication still runs before booking changes.

## Health Check

The service exposes a health endpoint at `GET /health` (on the internal port).

## Logs

View logs in the Render dashboard under your service's **Logs** tab.
