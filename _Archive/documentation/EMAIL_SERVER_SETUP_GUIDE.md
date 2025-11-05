# DEVOCEAN Lodge - Email Server Setup Guide
**Complete Installation & Configuration Guide**  
**Last Updated:** October 28, 2025

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Architecture](#architecture)
4. [Installation Steps](#installation-steps)
5. [Environment Variables](#environment-variables)
6. [Database Setup](#database-setup)
7. [Email Templates](#email-templates)
8. [Testing & Verification](#testing--verification)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance](#maintenance)

---

## 📖 Overview

The DEVOCEAN Lodge Email Automation Server is a production-ready Node.js/TypeScript service that:
- Monitors Beds24 booking notifications via IMAP
- Processes bookings and cancellations automatically
- Sends multi-language guest emails via Resend API
- Handles OTA bookings (Ostrovok, Booking.com, etc.)
- Runs on a scheduled cron (08:00, 14:00, 22:00 UTC daily)

### Key Features
✅ **6 Email Touchpoints:**
1. Post-booking confirmation (within 2 hours)
2. Pre-arrival information (7 days before)
3. Arrival reminder (2 days before)
4. Post-departure thank you (1 day after)
5. Cancellation confirmation (immediate)
6. Transfer notification to taxi company

✅ **Multi-language Support:** en-GB, en-US, pt-PT, pt-BR (extensible to all 16 website languages)  
✅ **OTA Platform Support:** Direct Beds24 bookings + OTA platforms  
✅ **Database Integration:** Supabase PostgreSQL for reliable storage  
✅ **Template System:** HTML email templates with translation JSON

---

## 🔧 System Requirements

### Server Environment
- **Node.js:** v20.19.3 or higher
- **npm:** Latest version
- **Database:** PostgreSQL 14+ (Supabase recommended)
- **Platform:** Replit, VPS, or any Node.js hosting

### Required NPM Packages
```json
{
  "dependencies": {
    "dotenv": "^17.2.3",
    "drizzle-orm": "^0.44.7",
    "express": "^4.21.2",
    "imap-simple": "^5.1.0",
    "mailparser": "^3.7.5",
    "node-cron": "^4.2.1",
    "nodemailer": "^7.0.6",
    "pg": "^8.16.3",
    "postgres": "^3.4.7",
    "resend": "^6.2.2",
    "zod": "^4.1.12"
  },
  "devDependencies": {
    "@types/node": "^24.9.1",
    "@types/node-cron": "^3.0.11",
    "@types/pg": "^8.15.5",
    "drizzle-kit": "^0.31.5"
  }
}
```

### External Services
1. **Supabase** - PostgreSQL database (or any PostgreSQL provider)
2. **Resend** - Transactional email API
3. **IMAP Email Account** - For receiving Beds24 notifications
4. **Beds24** - Booking management system

---

## 🏗️ Architecture

### System Flow
```
Beds24 Booking
    ↓
Email Notification (IMAP)
    ↓
Email Parser (server/services/email-parser.ts)
    ↓
Database Storage (Supabase PostgreSQL)
    ↓
Email Scheduler (server/services/email-scheduler.ts)
    ↓
Template Renderer (server/services/email-template-renderer.ts)
    ↓
Email Sender (Resend API)
    ↓
Guest Receives Email
```

### File Structure
```
/
├── server.ts                           # Main server entry point
├── start.js                            # Dual-server startup script
├── server/
│   └── services/
│       ├── email-parser.ts             # Parses Beds24 emails (+ OTA support)
│       ├── email-automation.ts         # Cron scheduler
│       ├── email-scheduler.ts          # Email queue management
│       ├── email-sender.ts             # Resend API integration
│       ├── email-template-renderer.ts  # Multi-language templates
│       ├── admin-reports.ts            # Daily/weekly reports
│       └── storage.ts                  # Database layer
├── shared/
│   └── schema.ts                       # Drizzle ORM schema
├── email_templates/
│   ├── post-booking.html               # Welcome email
│   ├── pre-arrival.html                # 7 days before check-in
│   ├── arrival.html                    # 2 days before check-in
│   ├── post-departure.html             # 1 day after check-out
│   ├── cancellation.html               # Cancellation confirmation
│   ├── transfer-notification.html      # Taxi company notification
│   └── translations.json               # Email translations (4 languages)
└── .env                                # Environment variables (DO NOT COMMIT)
```

---

## 📥 Installation Steps

### Step 1: Clone or Extract Backup
```bash
# If restoring from backup
tar -xzf devocean-lodge-backup-20251028.tar.gz
cd devocean-lodge-backup-20251028
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Set Up Environment Variables
Create a `.env` file in the project root:

```bash
# Database Configuration (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# Resend Email API
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL="DEVOCEAN Lodge - Ponta do Ouro" <reservations@devoceanlodge.com>

# IMAP Configuration (Receiving Beds24 Emails)
IMAP_HOST=mail.yourdomain.com
IMAP_PORT=993
IMAP_USER=reservations@devoceanlodge.com
IMAP_PASSWORD=your_imap_password
IMAP_TLS=true

# SMTP Configuration (Optional - Resend handles this)
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASSWORD=re_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Email Recipients
ADMIN_EMAIL=admin@devoceanlodge.com
TAXI_EMAIL=taxi@example.com

# Server Configuration
PORT=3003
NODE_ENV=production
```

### Step 4: Set Up Database Schema

**Option A: Using Drizzle Push (Recommended)**
```bash
npm run db:push
```

**Option B: Manual SQL Setup**
Run this SQL in your PostgreSQL database:

```sql
-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  group_ref VARCHAR(255) NOT NULL,
  booking_refs TEXT[] NOT NULL,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50),
  guest_language VARCHAR(10) NOT NULL DEFAULT 'en-GB',
  check_in_date TIMESTAMP NOT NULL,
  check_out_date TIMESTAMP NOT NULL,
  last_night_date TIMESTAMP NOT NULL,
  rooms JSONB NOT NULL,
  extras JSONB,
  total_price NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  source VARCHAR(50) NOT NULL DEFAULT 'beds24',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  post_booking_email_sent BOOLEAN DEFAULT FALSE,
  pre_arrival_email_sent BOOLEAN DEFAULT FALSE,
  arrival_email_sent BOOLEAN DEFAULT FALSE,
  post_departure_email_sent BOOLEAN DEFAULT FALSE,
  transfer_notification_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scheduled emails table
CREATE TABLE IF NOT EXISTS scheduled_emails (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL,
  scheduled_for TIMESTAMP NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP,
  error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  email_type VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  status VARCHAR(20) NOT NULL,
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email check logs table
CREATE TABLE IF NOT EXISTS email_check_logs (
  id SERIAL PRIMARY KEY,
  check_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  emails_found INTEGER DEFAULT 0,
  bookings_processed INTEGER DEFAULT 0,
  errors TEXT,
  status VARCHAR(20) NOT NULL
);

-- Pending cancellations table
CREATE TABLE IF NOT EXISTS pending_cancellations (
  id SERIAL PRIMARY KEY,
  group_ref VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  cancellation_date TIMESTAMP NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_group_ref ON bookings(group_ref);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in ON bookings(check_in_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_sent ON scheduled_emails(sent);
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_scheduled_for ON scheduled_emails(scheduled_for);
```

### Step 5: Test Database Connection
```bash
# Create a test file: test-db.js
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

console.log('Testing database connection...');
const result = await client`SELECT NOW()`;
console.log('✅ Database connected:', result);
process.exit(0);
```

Run: `node test-db.js`

### Step 6: Start the Email Server

**Development Mode:**
```bash
npx tsx server.ts
```

**Production Mode (with PM2):**
```bash
npm install -g pm2
pm2 start server.ts --interpreter npx --interpreter-args "tsx"
pm2 save
pm2 startup
```

**Dual Server Mode (Website + Email):**
```bash
npm run dev
```

---

## 🔑 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `RESEND_API_KEY` | Resend API key | `re_xxxxxxxxxxxxx` |
| `FROM_EMAIL` | Sender email address | `"DEVOCEAN Lodge" <reservations@example.com>` |
| `IMAP_HOST` | IMAP server hostname | `mail.example.com` |
| `IMAP_PORT` | IMAP port (SSL) | `993` |
| `IMAP_USER` | IMAP username | `reservations@example.com` |
| `IMAP_PASSWORD` | IMAP password | `your_password` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_EMAIL` | Admin notifications | None |
| `TAXI_EMAIL` | Taxi transfer notifications | None |
| `PORT` | Server port | `3003` |
| `NODE_ENV` | Environment | `development` |
| `SMTP_HOST` | SMTP server (if not using Resend) | None |
| `SMTP_PORT` | SMTP port | `465` |

---

## 🗄️ Database Setup

### Supabase Setup (Recommended)

1. **Create Supabase Project:**
   - Go to https://supabase.com
   - Create new project
   - Copy PostgreSQL connection string

2. **Run Schema:**
   - Open SQL Editor in Supabase
   - Paste the SQL schema from Step 4 above
   - Execute

3. **Configure Environment:**
   - Copy connection string to `.env` as `DATABASE_URL`

### Alternative PostgreSQL Setup

Any PostgreSQL 14+ database will work:
- AWS RDS
- Google Cloud SQL
- Railway
- Local PostgreSQL
- Heroku Postgres

---

## 📧 Email Templates

### Template Structure

Each template is a standalone HTML file in `email_templates/`:

```
email_templates/
├── post-booking.html          # Sent within 2 hours of booking
├── pre-arrival.html           # Sent 7 days before check-in
├── arrival.html               # Sent 2 days before check-in
├── post-departure.html        # Sent 1 day after check-out
├── cancellation.html          # Sent immediately on cancellation
├── transfer-notification.html # Sent to taxi company
└── translations.json          # Multi-language content
```

### Translation System

`translations.json` contains all translatable strings:

```json
{
  "en-GB": {
    "subject": {
      "post_booking": "Welcome to DEVOCEAN Lodge - Booking Confirmation",
      "pre_arrival": "Your Stay at DEVOCEAN Lodge - Important Information",
      "arrival": "We're Ready for You! Check-in Tomorrow",
      "post_departure": "Thank You for Staying at DEVOCEAN Lodge"
    },
    "content": {
      "greeting": "Dear {{guestName}}",
      "booking_confirmed": "Your booking is confirmed!",
      ...
    }
  },
  "pt-PT": { ... },
  "pt-BR": { ... },
  "en-US": { ... }
}
```

### Adding New Languages

1. Add language code to `translations.json`
2. Translate all strings
3. Update `email-template-renderer.ts` if needed
4. Test with sample booking

---

## ✅ Testing & Verification

### Manual Test

1. **Send Test Email:**
```bash
node test-email.js
```

2. **Check Email Templates:**
- Open `email_templates/post-booking.html` in browser
- Verify all placeholders render correctly

3. **Test IMAP Connection:**
```javascript
// test-imap.js
import imaps from 'imap-simple';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  imap: {
    user: process.env.IMAP_USER,
    password: process.env.IMAP_PASSWORD,
    host: process.env.IMAP_HOST,
    port: parseInt(process.env.IMAP_PORT),
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
  }
};

const connection = await imaps.connect(config);
console.log('✅ IMAP connected successfully');
await connection.end();
```

### Production Verification

1. **Check Logs:**
```bash
tail -f /tmp/logs/Start_application_*.log
```

2. **Verify Database:**
```sql
SELECT * FROM email_check_logs ORDER BY check_time DESC LIMIT 10;
SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5;
SELECT * FROM scheduled_emails WHERE sent = false;
```

3. **Monitor Cron Schedule:**
```bash
# Should run at 08:00, 14:00, 22:00 UTC
# Check logs at these times
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
Error: listen EADDRINUSE: address already in use 0.0.0.0:3003
```
**Solution:**
```bash
pkill -f "tsx server.ts"
# Or find and kill the process
lsof -i :3003
kill -9 <PID>
```

#### 2. Database Connection Failed
```bash
Error: Connection terminated unexpectedly
```
**Solution:**
- Check `DATABASE_URL` is correct
- Verify database is accessible
- Check firewall rules
- Test with `psql` command

#### 3. IMAP Authentication Failed
```bash
Error: Invalid credentials
```
**Solution:**
- Verify `IMAP_USER` and `IMAP_PASSWORD`
- Check email provider settings
- Enable IMAP in email account
- Use app-specific password if 2FA enabled

#### 4. Emails Not Sending
```bash
No emails sent even though scheduled_emails exist
```
**Solution:**
- Check `RESEND_API_KEY` is valid
- Verify `FROM_EMAIL` is authorized in Resend
- Check email logs table for errors
- Verify scheduled_for time is in the past

#### 5. OTA Bookings Not Parsing
```bash
Booking from Ostrovok not saved to database
```
**Solution:**
- Check email format matches parser expectations
- Group Ref is now optional (Oct 28 update)
- Missing emails use fallback: `noemail@devocean-lodge.com`
- Review `email-parser.ts` for pattern matching

---

## 🔧 Maintenance

### Daily Tasks
- Monitor email check logs
- Review failed emails in `email_logs` table
- Check disk space

### Weekly Tasks
- Review admin reports (Monday 06:00 UTC)
- Verify all scheduled emails sent
- Check database size
- Backup database

### Monthly Tasks
- Update npm packages
- Review and optimize database indexes
- Archive old email logs
- Test disaster recovery

### Database Cleanup
```sql
-- Delete old email logs (older than 6 months)
DELETE FROM email_logs WHERE sent_at < NOW() - INTERVAL '6 months';

-- Delete old check logs (older than 3 months)
DELETE FROM email_check_logs WHERE check_time < NOW() - INTERVAL '3 months';

-- Archive completed bookings (older than 1 year)
-- Create archive table first if needed
```

### Backup Strategy

**Automated Backup:**
```bash
# Add to crontab
0 2 * * * pg_dump $DATABASE_URL > /backup/devocean-$(date +\%Y\%m\%d).sql
```

**Manual Backup:**
```bash
pg_dump $DATABASE_URL > devocean-backup.sql
```

**Restore:**
```bash
psql $DATABASE_URL < devocean-backup.sql
```

---

## 📊 Monitoring

### Health Check Endpoint
```javascript
// Add to server.ts
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});
```

### Log Rotation
```bash
# Using logrotate
/var/log/devocean/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

### Metrics to Track
- Email delivery rate
- Processing time per booking
- Database query performance
- Error rate
- Queue length

---

## 🔐 Security Best Practices

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use environment variables** - Never hardcode credentials
3. **Rotate API keys regularly** - Every 90 days
4. **Enable database SSL** - For production
5. **Use strong passwords** - For IMAP/SMTP
6. **Limit database permissions** - Only necessary privileges
7. **Monitor access logs** - Regular security audits
8. **Enable 2FA** - On all external services
9. **Backup encryption** - Encrypt database backups
10. **Rate limiting** - Prevent abuse

---

## 📞 Support & Resources

### Documentation
- **Email Automation Setup:** `EMAIL_AUTOMATION_SETUP.md`
- **Language Support:** `LANGUAGE_SUPPORT.md`
- **Project Documentation:** `replit.md`
- **Configuration Summary:** `FINAL_CONFIGURATION_SUMMARY.md`

### External Resources
- **Resend Docs:** https://resend.com/docs
- **Beds24 API:** https://beds24.com/apidocs
- **Drizzle ORM:** https://orm.drizzle.team
- **Node-cron:** https://www.npmjs.com/package/node-cron

### Troubleshooting Commands
```bash
# Check server status
ps aux | grep "tsx server.ts"

# View logs
tail -f /tmp/logs/Start_application_*.log

# Test database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM bookings;"

# Test email sending
node test-email.js

# Restart server
pkill -f "tsx server.ts" && npx tsx server.ts
```

---

## 🎯 Quick Start Checklist

- [ ] Install Node.js 20+
- [ ] Run `npm install`
- [ ] Create `.env` file with all required variables
- [ ] Set up PostgreSQL database (Supabase recommended)
- [ ] Run database schema SQL
- [ ] Test database connection
- [ ] Test IMAP connection
- [ ] Verify Resend API key
- [ ] Start email server
- [ ] Send test email
- [ ] Verify cron schedule
- [ ] Monitor first automated run
- [ ] Set up backups
- [ ] Configure monitoring

---

**Setup Complete!** 🎉  
Your email automation server is now ready for production use.

For questions or issues, refer to the troubleshooting section or review the logs.
