# DEVOCEAN Lodge Email Automation System

## Overview

Comprehensive automated email system that processes Beds24 booking notifications and sends templated emails at 4 touchpoints, with advanced features:

### Email Touchpoints
1. **Post-booking** - Within 2 hours after booking (confirmation email)
2. **Pre-arrival** - 7 days before check-in at 09:00 (preparation info)
3. **Arrival** - 2 days before check-in at 09:00 (final details reminder)
4. **Post-departure** - 1 day after check-out at 10:00 (thank you & review request)

### Advanced Features
✅ **Cancellation Handling** - Automatically stops scheduled emails when guests cancel
✅ **Transfer Notifications** - Sends booking requests to taxi company when transfers are required
✅ **Extras Management** - Tracks extra beds, transfers, special requests, dietary requirements
✅ **Multi-language Templates** - Standalone HTML templates (EN, PT, easily extendable)
✅ **Booking Status Tracking** - Active, cancelled, completed statuses

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

# Taxi Company for Transfer Notifications (Optional)
TAXI_EMAIL=taxi@example.com
TAXI_WHATSAPP=+258123456789
TAXI_NAME=Ponta Transfer Service
```

**Note**: Taxi company configuration is optional. If not provided, the system will still work but won't send transfer notifications.

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
- **Core Fields**: group_ref, booking_refs, guest details, dates, rooms, prices
- **Status Fields**: status (active/cancelled/completed), cancelled_at, cancellation_reason
- **Email Tracking**: post_booking_email_sent, pre_arrival_email_sent, arrival_email_sent, post_departure_email_sent
- **Extras (JSONB)**:
  - `extraBeds`: Number of extra beds required
  - `transfer`: Complete transfer booking details (arrival/departure, pickup locations, times, flight numbers)
  - `specialRequests`: Guest special requests
  - `dietaryRequirements`: Dietary restrictions
  - `otherExtras`: Array of additional items (name, quantity, price)
- **Transfer Tracking**: transfer_notification_sent flag

### scheduled_emails
- Stores emails that need to be sent
- Fields: booking_id, email_type, recipient, scheduled_for, status (pending/sent/failed/cancelled)

### email_logs
- Audit trail of all sent emails
- Fields: to, subject, status, provider, message_id, error_message

### email_check_logs
- Tracks email check runs
- Fields: check_time, emails_found, emails_processed, status

## Email Templates

### Standalone HTML Files
Located in `/email_templates/`:
- `post_booking_en.html` - Booking confirmation
- `pre_arrival_en.html` - Pre-arrival information
- `arrival_en.html` - Arrival reminder
- `post_departure_en.html` - Thank you & review request

### Template Features
- **Responsive Design**: Works on all devices
- **Ocean Blue Branding**: Matches DEVOCEAN Lodge brand
- **Personalization**: Uses {{placeholders}} for dynamic content (guestName, checkInDate, etc.)
- **Multi-language**: Currently EN & PT, easily extendable to more languages
- **Professional Styling**: Email client compatible (Gmail, Outlook, etc.)
- **Clear CTAs**: Book again, visit website, leave review

### Adding New Languages
1. Copy existing HTML template (e.g., `post_booking_en.html`)
2. Rename with language code (e.g., `post_booking_pt.html`)
3. Translate content while keeping {{placeholders}} intact
4. Update `email-templates.ts` to load new language template

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

## Key Features Explained

### 1. Cancellation Handling

When a guest cancels their reservation, Beds24 sends a cancellation email. The system:
1. Detects cancellation keywords in the email
2. Extracts the booking reference
3. Updates booking status to 'cancelled' in database
4. **Automatically cancels all pending scheduled emails**
5. Prevents sending emails to cancelled bookings

This ensures guests don't receive pre-arrival or other emails for bookings they've cancelled.

### 2. Transfer Notifications

When a booking includes transfer requests (airport pickup/dropoff), the system:
1. Detects transfer requirements in booking extras
2. Sends detailed booking request to taxi company via email
3. Includes pickup/dropoff locations, times, flight numbers, passenger count
4. Marks transfer notification as sent to avoid duplicates
5. Logs all transfer notifications for tracking

**Email to taxi company includes**:
- Guest details (name, email, phone, language)
- Booking reference and check-in/out dates
- Arrival transfer details (if applicable)
- Departure transfer details (if applicable)
- Request for confirmation

**Future**: WhatsApp notifications when configured (requires Twilio integration)

### 3. Extras Management

The system tracks various booking extras in a flexible JSONB field:

**Extra Beds**: Number of additional beds requested
**Transfers**: Complete transfer booking with arrival/departure details
**Special Requests**: Any specific guest requests
**Dietary Requirements**: Food allergies, preferences
**Other Extras**: Custom items with name, quantity, and price

All extras are stored in structured format for easy querying and reporting.

## Future Enhancements

Potential improvements for the system:
- [ ] WhatsApp transfer notifications via Twilio
- [ ] SMS booking confirmations
- [ ] Email open/click tracking
- [ ] A/B testing for email content
- [ ] Admin dashboard for monitoring bookings and emails
- [ ] Webhook endpoints for real-time booking notifications (faster than IMAP)
- [ ] Email bounce handling and list management
- [ ] Unsubscribe management
- [ ] More language templates (NL, FR, DE, IT, ES)
- [ ] PDF invoice generation and attachment

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
