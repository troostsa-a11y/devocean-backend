import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { EmailAutomationService } from './server/services/email-automation';
import { DatabaseService } from './server/services/database';

/**
 * DEVOCEAN Lodge Email Automation Server
 * Automatically processes Beds24 booking notifications and sends scheduled emails
 */

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(express.json());
app.use(cors()); // Allow Cloudflare Functions to call these endpoints

// Environment validation
function validateEnvironment() {
  const required = [
    'DATABASE_URL',
    'MAIL_HOST',
    'MAIL_PORT',
    'IMAP_USER',
    'IMAP_PASSWORD',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('Missing required environment variables:');
    missing.forEach(key => console.error(`  - ${key}`));
    console.error('\nPlease add these in your Render Environment settings');
    return false;
  }

  return true;
}

// Get taxi company config (optional)
function getTaxiConfig() {
  if (!process.env.TAXI_EMAIL) {
    return undefined;
  }

  return {
    email: process.env.TAXI_EMAIL,
    whatsapp: process.env.TAXI_WHATSAPP,
    name: process.env.TAXI_NAME || 'Taxi Company',
  };
}

// Initialize email automation service
let emailService;

if (validateEnvironment()) {
  try {
    const taxiConfig = getTaxiConfig();
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@devoceanlodge.com';
    const fromEmail = process.env.IMAP_FROM_EMAIL || 'booking@devoceanlodge.com';
    const fromName = process.env.IMAP_FROM_NAME || 'DEVOCEAN Lodge Bookings';
    const bccEmail = process.env.BCC_EMAIL || 'beds24@devoceanlodge.com';
    
    // SMTP config for sending emails (port 465 for SMTP SSL, same as contact form)
    const smtpConfig = {
      host: process.env.MAIL_HOST!,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.IMAP_USER!,
        pass: process.env.IMAP_PASSWORD!,
      },
    };
    
    // IMAP config for reading emails (port 993 for IMAP SSL, not MAIL_PORT which is for SMTP)
    const imapConfig = {
      host: process.env.IMAP_HOST || process.env.MAIL_HOST!,
      port: parseInt(process.env.IMAP_PORT || '993'),
      user: process.env.IMAP_USER!,
      password: process.env.IMAP_PASSWORD!,
      tls: process.env.IMAP_TLS === 'ssl' || process.env.IMAP_TLS === 'true',
    };
    
    emailService = new EmailAutomationService(
      process.env.DATABASE_URL!,
      smtpConfig,
      imapConfig,
      taxiConfig,
      adminEmail,
      fromEmail,
      fromName,
      bccEmail
    );

    if (taxiConfig) {
      console.log(`📧 Transfer notifications enabled for ${taxiConfig.name}`);
    }

    console.log(`📊 Admin reports enabled for ${adminEmail}`);
    console.log(`📧 Sending emails from: "${fromName}" <${fromEmail}>`);
    console.log(`📧 BCC copies sent to: ${bccEmail}`);

    // Start the automated email checking
    emailService.start();
    console.log('✅ Email automation service started successfully');
    console.log('📧 Checking emails every 30 minutes (at :00 and :30 of every hour)');
  } catch (error) {
    console.error('❌ Failed to initialize email automation service:', error);
    process.exit(1);
  }
} else {
  console.warn('⚠️  Email automation service not started due to missing configuration');
}

// ─── Guest CRM database (works independently of full email service) ───────────
let guestDb: DatabaseService | null = null;
if (process.env.DATABASE_URL) {
  guestDb = new DatabaseService(process.env.DATABASE_URL);
  guestDb.initGuestsTable()
    .then(() => console.log('✅ Guests table ready'))
    .catch((err) => console.error('❌ Failed to create guests table:', err));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'DEVOCEAN Lodge Email Automation',
    timestamp: new Date().toISOString(),
    emailServiceRunning: !!emailService,
  });
});

// Admin API key authentication middleware
function requireAdminKey(req: any, res: any, next: any) {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    return res.status(503).json({ error: 'Admin API key not configured on server' });
  }

  const providedKey = req.headers['x-admin-key'] || req.query.key;
  if (!providedKey || providedKey !== adminKey) {
    return res.status(401).json({ error: 'Invalid or missing admin API key' });
  }

  next();
}

// Admin: Create a manual booking and schedule all emails
app.post('/api/admin/booking', requireAdminKey, async (req, res) => {
  if (!emailService) {
    return res.status(503).json({ error: 'Email automation service not initialized' });
  }

  try {
    const { groupRef, bookingRefs, guestName, firstName, guestGender, guestEmail, guestLanguage, guestCountry, checkInDate, checkOutDate } = req.body;

    if (!groupRef || !guestName || !firstName || !guestEmail || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['groupRef', 'guestName', 'firstName', 'guestEmail', 'checkInDate', 'checkOutDate'],
        optional: ['bookingRefs', 'guestGender', 'guestLanguage', 'guestCountry'],
      });
    }

    const result = await emailService.createManualBooking({
      groupRef,
      bookingRefs,
      guestName,
      firstName,
      guestGender: guestGender || null,
      guestEmail,
      guestLanguage: guestLanguage || 'EN',
      guestCountry,
      checkInDate,
      checkOutDate,
    });

    res.json({
      success: true,
      message: `Booking ${groupRef} created and ${result.scheduledEmails.length} emails scheduled`,
      booking: {
        id: result.booking.id,
        groupRef: result.booking.groupRef,
        guestName: result.booking.guestName,
        guestEmail: result.booking.guestEmail,
        guestLanguage: result.booking.guestLanguage,
        checkInDate: result.booking.checkInDate,
        checkOutDate: result.booking.checkOutDate,
      },
      scheduledEmails: result.scheduledEmails.map((e: any) => ({
        type: e.emailType,
        scheduledFor: e.scheduledFor,
        status: e.status,
      })),
    });
  } catch (error: any) {
    console.error('[ADMIN] Error creating manual booking:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }
    res.status(error.message?.includes('already exists') ? 409 : 500).json({
      error: 'Failed to create booking',
      message: error.message,
    });
  }
});

// Admin: Cancel a booking by group reference
app.post('/api/admin/cancel', requireAdminKey, async (req, res) => {
  if (!emailService) {
    return res.status(503).json({ error: 'Email automation service not initialized' });
  }

  try {
    const { groupRef, reason } = req.body;

    if (!groupRef) {
      return res.status(400).json({
        error: 'Missing required field: groupRef',
        required: ['groupRef'],
        optional: ['reason'],
      });
    }

    const result = await emailService.cancelManualBooking(groupRef, reason);

    res.json({
      success: true,
      message: `Booking ${groupRef} cancelled. ${result.cancelledEmails} pending emails stopped. Cancellation email scheduled.`,
      booking: {
        groupRef: result.booking.groupRef,
        guestName: result.booking.guestName,
        guestEmail: result.booking.guestEmail,
      },
      cancelledEmails: result.cancelledEmails,
    });
  } catch (error: any) {
    console.error('[ADMIN] Error cancelling booking:', error);
    const status = error.message?.includes('not found') ? 404 :
                   error.message?.includes('already cancelled') ? 409 : 500;
    res.status(status).json({
      error: 'Failed to cancel booking',
      message: error.message,
    });
  }
});

// Admin: Modify booking dates and resend post-booking confirmation
app.post('/api/admin/modify-dates', requireAdminKey, async (req, res) => {
  if (!emailService) {
    return res.status(503).json({ error: 'Email automation service not initialized' });
  }

  try {
    const { groupRef, checkInDate, checkOutDate } = req.body;

    if (!groupRef || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['groupRef', 'checkInDate', 'checkOutDate'],
      });
    }

    const result = await emailService.modifyBookingDates(groupRef, checkInDate, checkOutDate);

    res.json({
      success: true,
      message: `Booking ${groupRef} dates updated. ${result.cancelledEmails} old emails cancelled. ${result.scheduledEmails.length} emails rescheduled, including a new post-booking confirmation.`,
      booking: {
        groupRef: result.booking.groupRef,
        guestName: result.booking.guestName,
        guestEmail: result.booking.guestEmail,
        checkInDate: result.booking.checkInDate,
        checkOutDate: result.booking.checkOutDate,
      },
      cancelledEmails: result.cancelledEmails,
      scheduledEmails: result.scheduledEmails.map((e: any) => ({
        type: e.emailType,
        scheduledFor: e.scheduledFor,
        status: e.status,
      })),
    });
  } catch (error: any) {
    console.error('[ADMIN] Error modifying booking dates:', error);
    const status = error.message?.includes('not found') ? 404 :
                   error.message?.includes('cancelled') ? 409 : 500;
    res.status(status).json({
      error: 'Failed to modify booking dates',
      message: error.message,
    });
  }
});

// Admin: Update guest email for a booking
app.post('/api/admin/update-email', requireAdminKey, async (req, res) => {
  if (!emailService) {
    return res.status(503).json({ error: 'Email automation service not initialized' });
  }

  try {
    const { groupRef, newEmail } = req.body;

    if (!groupRef || !newEmail) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['groupRef', 'newEmail'],
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({ error: 'Invalid email address format' });
    }

    const result = await emailService.updateGuestEmail(groupRef, newEmail);

    res.json({
      success: true,
      message: `Email updated for booking ${groupRef}. ${result.pendingEmailsUpdated} pending emails redirected to ${newEmail}.`,
      booking: {
        groupRef: result.booking.groupRef,
        guestName: result.booking.guestName,
        oldEmail: result.oldEmail,
        newEmail: result.booking.guestEmail,
      },
      pendingEmailsUpdated: result.pendingEmailsUpdated,
    });
  } catch (error: any) {
    console.error('[ADMIN] Error updating guest email:', error);
    const status = error.message?.includes('not found') ? 404 : 500;
    res.status(status).json({
      error: 'Failed to update email',
      message: error.message,
    });
  }
});

// Manual email check endpoint (for testing)
app.post('/api/check-emails', async (req, res) => {
  if (!emailService) {
    return res.status(503).json({
      error: 'Email automation service not initialized',
    });
  }

  try {
    console.log('🔍 Manual email check triggered');
    await emailService.runManualCheck();
    res.json({
      success: true,
      message: 'Email check completed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error during manual email check:', error);
    res.status(500).json({
      error: 'Failed to check emails',
      message: error.message,
    });
  }
});

// API documentation endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'DEVOCEAN Lodge Email Automation API',
    version: '1.0.0',
    endpoints: {
      health: {
        method: 'GET',
        path: '/health',
        description: 'Health check endpoint',
      },
      checkEmails: {
        method: 'POST',
        path: '/api/check-emails',
        description: 'Manually trigger email check (for testing)',
      },
      adminCreateBooking: {
        method: 'POST',
        path: '/api/admin/booking',
        description: 'Create a manual booking and schedule all emails (requires X-Admin-Key header)',
        body: {
          required: ['groupRef', 'guestName', 'firstName', 'guestEmail', 'checkInDate', 'checkOutDate'],
          optional: ['bookingRefs', 'guestGender', 'guestLanguage', 'guestCountry'],
        },
      },
      adminModifyDates: {
        method: 'POST',
        path: '/api/admin/modify-dates',
        description: 'Modify booking dates, reschedule all emails, and resend post-booking confirmation (requires X-Admin-Key header)',
        body: {
          required: ['groupRef', 'checkInDate', 'checkOutDate'],
        },
      },
      adminUpdateEmail: {
        method: 'POST',
        path: '/api/admin/update-email',
        description: 'Update guest email for a booking (requires X-Admin-Key header)',
        body: {
          required: ['groupRef', 'newEmail'],
        },
      },
      adminCancelBooking: {
        method: 'POST',
        path: '/api/admin/cancel',
        description: 'Cancel a booking by group reference (requires X-Admin-Key header)',
        body: {
          required: ['groupRef'],
          optional: ['reason'],
        },
      },
    },
    schedule: {
      emailChecks: 'Every 30 minutes at :00 and :30',
      emailSending: 'Every 30 minutes at :15 and :45',
      dailyReports: '14:00 CAT (12:00 UTC)',
      weeklyReports: '08:00 CAT Monday (06:00 UTC Monday)',
    },
    emailTypes: [
      {
        type: 'post_booking',
        description: 'Sent within 2 hours after booking',
      },
      {
        type: 'pre_arrival',
        description: 'Sent 7 days before check-in at 09:00',
      },
      {
        type: 'arrival',
        description: 'Sent 2 days before check-in at 09:00',
      },
      {
        type: 'post_departure',
        description: 'Sent 1 day after check-out at 10:00',
      },
    ],
  });
});

// ─── Guest CRM Routes ──────────────────────────────────────────────────────────

// POST /api/admin/guests/import  — bulk upsert
app.post('/api/admin/guests/import', requireAdminKey, async (req: any, res: any) => {
  if (!guestDb) return res.status(503).json({ error: 'Database not initialised' });
  try {
    const { records } = req.body as { records: any[] };
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'records array required' });
    }

    // Attach a unique unsubscribe token to each record that lacks one
    const enriched = records.map((r: any) => ({
      ...r,
      unsubscribeToken: r.unsubscribeToken || crypto.randomUUID(),
    }));

    const result = await guestDb.upsertGuests(enriched);
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Guest import error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/guests  — paginated list
app.get('/api/admin/guests', requireAdminKey, async (req: any, res: any) => {
  if (!guestDb) return res.status(503).json({ error: 'Database not initialised' });
  try {
    const { page, limit, subscribed, source, search } = req.query;
    const result = await guestDb.getGuests({
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 50,
      subscribed: subscribed === 'true' ? true : subscribed === 'false' ? false : undefined,
      source: source as string | undefined,
      search: search as string | undefined,
    });
    const stats = await guestDb.getGuestStats();
    res.json({ ...result, stats });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/guests/export/google  — Google Customer Match CSV
app.get('/api/admin/guests/export/google', requireAdminKey, async (req: any, res: any) => {
  if (!guestDb) return res.status(503).json({ error: 'Database not initialised' });
  try {
    const contacts = await guestDb.getSubscribedGuests();
    const lines = ['Email Address,First Name,Last Name'];
    for (const c of contacts) {
      const email = c.email.toLowerCase().trim();
      const first = (c.firstName || '').replace(/"/g, '');
      const last = (c.lastName || '').replace(/"/g, '');
      lines.push(`"${email}","${first}","${last}"`);
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="devocean-google-customer-match.csv"');
    res.send(lines.join('\r\n'));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/guests/broadcast  — send marketing email to all subscribers
app.post('/api/admin/guests/broadcast', requireAdminKey, async (req: any, res: any) => {
  if (!guestDb) return res.status(503).json({ error: 'Database not initialised' });

  const { subject, html, testEmail } = req.body as { subject: string; html: string; testEmail?: string };
  if (!subject || !html) return res.status(400).json({ error: 'subject and html required' });

  // Build SMTP config from env vars
  if (!process.env.MAIL_HOST || !process.env.IMAP_USER || !process.env.IMAP_PASSWORD) {
    return res.status(503).json({ error: 'SMTP not configured' });
  }
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: { user: process.env.IMAP_USER, pass: process.env.IMAP_PASSWORD },
  });

  const fromEmail = process.env.IMAP_FROM_EMAIL || 'booking@devoceanlodge.com';
  const fromName = process.env.IMAP_FROM_NAME || 'DEVOCEAN Lodge';
  const baseUrl = process.env.BASE_URL || 'https://devocean-automailer.onrender.com';

  // Test-send mode — send only to testEmail and return immediately
  if (testEmail) {
    const testHtml = html + `<br><br><hr style="border:none;border-top:1px solid #eee"><p style="font-size:11px;color:#999;text-align:center">Test send — unsubscribe link placeholder</p>`;
    await transporter.sendMail({ from: `"${fromName}" <${fromEmail}>`, to: testEmail, subject: `[TEST] ${subject}`, html: testHtml });
    return res.json({ success: true, mode: 'test', sent: 1 });
  }

  // Live broadcast — start async, return immediately
  const recipients = await guestDb.getSubscribedGuests();
  res.json({ success: true, mode: 'live', queued: recipients.length });

  // Fire-and-forget
  (async () => {
    let sent = 0;
    let failed = 0;
    for (const r of recipients) {
      try {
        const token = r.unsubscribeToken || crypto.randomUUID();
        const unsubUrl = `${baseUrl}/unsubscribe/${token}`;
        const footer = `<br><br><hr style="border:none;border-top:1px solid #eee"><p style="font-size:11px;color:#999;text-align:center">You are receiving this because you stayed at DEVOCEAN Lodge.<br><a href="${unsubUrl}" style="color:#9e4b13">Unsubscribe</a></p>`;
        await transporter.sendMail({ from: `"${fromName}" <${fromEmail}>`, to: r.email, subject, html: html + footer });
        sent++;
      } catch (e) {
        failed++;
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    console.log(`📧 Broadcast complete: ${sent} sent, ${failed} failed`);
  })();
});

// GET /unsubscribe/:token  — public, one-click unsubscribe
app.get('/unsubscribe/:token', async (req: any, res: any) => {
  if (!guestDb) return res.status(503).send('<h2>Service unavailable</h2>');
  const { token } = req.params;
  try {
    const changed = await guestDb.unsubscribeGuest(token);
    const html = changed
      ? `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Unsubscribed</title></head><body style="font-family:sans-serif;max-width:480px;margin:60px auto;text-align:center;color:#333"><h2 style="color:#2a7060">You have been unsubscribed</h2><p>You will no longer receive marketing emails from DEVOCEAN Lodge.</p><p style="margin-top:32px"><a href="https://www.devoceanlodge.com" style="color:#9e4b13">Return to DEVOCEAN Lodge</a></p></body></html>`
      : `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Already unsubscribed</title></head><body style="font-family:sans-serif;max-width:480px;margin:60px auto;text-align:center;color:#333"><h2>Already unsubscribed</h2><p>This email address is already unsubscribed or the link is invalid.</p><p style="margin-top:32px"><a href="https://www.devoceanlodge.com" style="color:#9e4b13">Return to DEVOCEAN Lodge</a></p></body></html>`;
    res.send(html);
  } catch (err: any) {
    res.status(500).send('<h2>Error</h2>');
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log('🌊 DEVOCEAN Lodge Email Automation Server');
  console.log(`${'='.repeat(60)}`);
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📅 Email checks every 30 min (at :00 and :30), sends at :15 and :45`);
  console.log(`📧 Processing Beds24 booking notifications automatically`);
  console.log(`${'='.repeat(60)}\n`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  if (emailService) {
    emailService.stop();
    await emailService.close();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  if (emailService) {
    emailService.stop();
    await emailService.close();
  }
  process.exit(0);
});
