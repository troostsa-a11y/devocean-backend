# DEVOCEAN Lodge Email Automation System

## Overview

Automated email system that processes Beds24 booking notifications and sends templated emails at 4 touchpoints:

1. **Post-booking** - Within 2 hours after booking (confirmation email)
2. **Pre-arrival** - 7 days before check-in at 09:00 (preparation info)
3. **Arrival** - 2 days before check-in at 09:00 (final details reminder)
4. **Post-departure** - 1 day after check-out at 10:00 (thank you & review request)

## Architecture

```
┌──────────────┐
│  Beds24      │
│  Booking     │──> Email notification
│  System      │
└──────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────┐
│  IMAP Email Parser                                   │
│  (Checks at 08:00, 14:00, 22:00 UTC)                │
└──────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────┐
│  Supabase PostgreSQL Database                        │
│  - bookings                                          │
│  - scheduled_emails                                  │
│  - email_logs                                        │
│  - email_check_logs                                  │
└──────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────┐
│  Email Scheduler Service                             │
│  (Calculates send times for each touchpoint)        │
└──────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────┐
│  Email Sender Service (Resend API)                   │
│  (Sends scheduled emails with templates)            │
└──────────────────────────────────────────────────────┘
```

## Setup Instructions

### 1. Database Setup (Supabase)

1. Log into your Supabase account
2. Create a new project or use existing one
3. Get your PostgreSQL connection string (Settings > Database > Connection string)
4. Run the migration file to create tables:

```sql
-- Copy and run the SQL from drizzle/0000_initial_schema.sql
-- This creates:
-- - bookings table
-- - scheduled_emails table
-- - email_logs table
-- - email_check_logs table
```

### 2. Email Service Setup (Resend)

1. Sign up for Resend (https://resend.com)
2. Get your API key from the dashboard
3. Verify your sending domain (e.g., devoceanlodge.com)
4. Add the API key to your .env file

### 3. IMAP Email Account Setup

You need an email account that receives Beds24 booking notifications:

1. Configure Beds24 to send booking notifications to this email
2. Enable IMAP access on the email account
3. Get IMAP credentials (host, port, username, password)
4. Add credentials to your .env file

**Recommended IMAP Settings:**
- Gmail: imap.gmail.com, port 993, TLS enabled
- Outlook: outlook.office365.com, port 993, TLS enabled
- Custom domain: Check your email provider's documentation

### 4. Environment Variables

Create a `.env` file in the root directory:

```bash
# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# Email Service (Resend)
RESEND_API_KEY=re_your_api_key_here

# IMAP Email Account (for receiving Beds24 notifications)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=booking@devoceanlodge.com
IMAP_PASSWORD=your_app_password_here
IMAP_TLS=true

# Sender Email
FROM_EMAIL=booking@devoceanlodge.com
```

### 5. Running the Email Automation Server

The email automation runs as a standalone Node.js server:

```bash
# Install dependencies (if not already installed)
npm install

# Run the email automation server
node server.js
```

The server will:
- Start on port 3000 (or PORT env variable)
- Check emails at 08:00, 14:00, 22:00 UTC daily
- Process Beds24 booking notifications automatically
- Send scheduled emails at calculated times

### 6. Testing

#### Manual Email Check
You can manually trigger an email check (for testing):

```bash
curl -X POST http://localhost:3000/api/check-emails
```

#### Health Check
Check if the service is running:

```bash
curl http://localhost:3000/health
```

## Database Schema

### bookings
- Stores all booking information from Beds24 notifications
- Fields: group_ref, booking_refs, guest details, dates, rooms, prices, email status flags

### scheduled_emails
- Stores emails that need to be sent
- Fields: booking_id, email_type, recipient, scheduled_for, status

### email_logs
- Audit trail of all sent emails
- Fields: to, subject, status, provider, message_id, error_message

### email_check_logs
- Tracks email check runs
- Fields: check_time, emails_found, emails_processed, status

## Email Templates

Templates are available in 2 languages (easily extendable):
- English (EN)
- Portuguese (PT)

Each template includes:
- Responsive HTML design
- Ocean Blue branding
- Personalized content
- Clear call-to-action buttons

## Cron Schedule

The system checks for new emails **3 times daily**:
- **08:00 UTC** - Morning check
- **14:00 UTC** - Afternoon check
- **22:00 UTC** - Evening check

This ensures bookings are processed within a reasonable timeframe without overwhelming the email server.

## Email Send Schedule

### Post-booking Email
- **When:** Within 2 hours after booking created
- **Content:** Booking confirmation, reference number, dates, total price, what's next

### Pre-arrival Email
- **When:** 7 days before check-in at 09:00 local time
- **Content:** Getting here, what to pack, activities, important info

### Arrival Email
- **When:** 2 days before check-in at 09:00 local time
- **Content:** Final details, contact information, last-minute reminders

### Post-departure Email
- **When:** 1 day after check-out at 10:00 local time
- **Content:** Thank you, review request, social media links, book again CTA

## Monitoring & Logs

### Database Logs
All email activity is logged in the database:

```sql
-- Check recent email checks
SELECT * FROM email_check_logs ORDER BY check_time DESC LIMIT 10;

-- Check pending emails
SELECT * FROM scheduled_emails WHERE status = 'pending';

-- Check recent bookings
SELECT * FROM bookings ORDER BY created_at DESC LIMIT 10;

-- Check email send history
SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 20;
```

### Server Logs
The server outputs detailed logs to console:
- Email check runs
- Booking processing
- Email sending
- Errors and warnings

## Troubleshooting

### No emails being processed
1. Check IMAP credentials are correct
2. Verify Beds24 is sending notifications to the correct email
3. Check email check logs in database
4. Run manual check: `curl -X POST http://localhost:3000/api/check-emails`

### Emails not being sent
1. Check Resend API key is valid
2. Verify sending domain is verified in Resend
3. Check scheduled_emails table for pending emails
4. Check email_logs table for error messages

### Database connection issues
1. Verify DATABASE_URL is correct
2. Check Supabase project is running
3. Test connection with psql or database client

## Security Best Practices

1. **Never commit .env file** - Add it to .gitignore
2. **Use app-specific passwords** - For IMAP if using Gmail/Outlook
3. **Rotate API keys regularly** - Resend and database credentials
4. **Monitor email logs** - Check for suspicious activity
5. **Use HTTPS** - When accessing the API endpoints

## Future Enhancements

Potential improvements for the system:
- [ ] Add more language templates (Dutch, French, German, etc.)
- [ ] SMS notifications via Twilio
- [ ] WhatsApp notifications
- [ ] Email open/click tracking
- [ ] A/B testing for email content
- [ ] Admin dashboard for monitoring
- [ ] Webhook endpoints for real-time booking notifications
- [ ] Email bounce handling
- [ ] Unsubscribe management

## Support

For issues or questions:
- Check the logs: Server console and database tables
- Review this documentation
- Test with manual email check endpoint
- Verify all environment variables are set correctly

## File Structure

```
.
├── server.js                          # Main email automation server
├── server/
│   └── services/
│       ├── email-automation.ts        # Main orchestration service
│       ├── email-parser.ts            # Beds24 email parser
│       ├── email-scheduler.ts         # Email scheduling logic
│       ├── email-sender.ts            # Resend integration
│       ├── email-templates.ts         # Multi-language templates
│       └── database.ts                # Database service
├── shared/
│   └── schema.ts                      # Database schema & types
├── drizzle/
│   └── 0000_initial_schema.sql       # Database migration
├── .env                               # Environment variables (create this)
├── .env.example                       # Environment template
└── EMAIL_AUTOMATION_SETUP.md         # This file
```

## API Endpoints

### GET /
Returns service information and documentation

### GET /health
Health check endpoint

```json
{
  "status": "ok",
  "service": "DEVOCEAN Lodge Email Automation",
  "timestamp": "2025-10-25T21:00:00.000Z",
  "emailServiceRunning": true
}
```

### POST /api/check-emails
Manually trigger email check (for testing)

```json
{
  "success": true,
  "message": "Email check completed",
  "timestamp": "2025-10-25T21:00:00.000Z"
}
```

## License

Proprietary - DEVOCEAN Lodge
