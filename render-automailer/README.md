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
| `DATABASE_URL` | Supabase PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
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
| `IMAP_TLS` | `ssl` | TLS mode (`ssl` or `true`) |
| `IMAP_FROM_EMAIL` | `booking@devoceanlodge.com` | Sender email address |
| `IMAP_FROM_NAME` | `DEVOCEAN Lodge Bookings` | Sender display name |
| `ADMIN_EMAIL` | `admin@devoceanlodge.com` | Admin report recipient |
| `BCC_EMAIL` | `beds24@devoceanlodge.com` | BCC for all guest emails |
| `TAXI_EMAIL` | - | Taxi company notification email |
| `TAXI_WHATSAPP` | - | Taxi company WhatsApp number |
| `TAXI_NAME` | `Taxi Company` | Taxi company name |

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

## Health Check

The service exposes a health endpoint at `GET /health` (on the internal port).

## Logs

View logs in the Render dashboard under your service's **Logs** tab.
