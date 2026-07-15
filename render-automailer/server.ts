import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { EmailAutomationService } from './server/services/email-automation';
import { DatabaseService } from './server/services/database';
import { createBookingRouter } from './server/routes/booking';

/**
 * DEVOCEAN Lodge Email Automation Server
 * Automatically processes Beds24 booking notifications and sends scheduled emails
 */

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
// Capture the raw body so the Stripe webhook can verify signatures (Stripe
// needs the exact bytes, not the re-serialized JSON).
app.use(express.json({
  verify: (req: any, _res, buf) => { req.rawBody = buf; },
}));
app.use(cors()); // Allow Cloudflare Functions to call these endpoints

// Serve email template assets (header image) at a stable public URL so broadcast
// emails can reference them without inline CID attachments.
// e.g. https://devocean-automailer.onrender.com/assets/email-header.jpg
app.use('/assets', express.static('./email_templates/assets'));

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
  guestDb.initDirectBookingsTable()
    .then(() => console.log('✅ Direct bookings table ready'))
    .catch((err) => console.error('❌ Failed to create direct_bookings table:', err));
  guestDb.initDiscountCodesTable()
    .then(() => console.log('✅ Discount codes table ready'))
    .catch((err) => console.error('❌ Failed to create coupon_codes table:', err));
  guestDb.initGiftVouchersTable()
    .then(() => console.log('✅ Gift vouchers table ready'))
    .catch((err) => console.error('❌ Failed to create gift_vouchers table:', err));
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

  const providedKey = req.headers['x-admin-key'];
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

    // Upsert the real email into the guest CRM now that we have it
    if (guestDb) {
      try {
        const b = result.booking;
        const firstName = b.firstName || null;
        const lastName = b.guestName && firstName && b.guestName.startsWith(firstName)
          ? b.guestName.slice(firstName.length).trim() || null
          : null;
        await guestDb.upsertGuests([{
          email: newEmail.trim().toLowerCase(),
          firstName,
          lastName,
          countryCode: b.guestCountry ? String(b.guestCountry).toUpperCase().slice(0, 2) : null,
          subscribed: true,
          source: 'beds24',
          unsubscribeToken: crypto.randomUUID(),
        }]);
      } catch (crmErr) {
        console.error('[CRM] Failed to upsert guest after email update:', crmErr);
      }
    }

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

// GA4 attribution session storage — called by Cloudflare Pages Function when
// visitor clicks "Book Now", storing their GA4 client_id for later matching.
app.post('/api/track-session', requireAdminKey, async (req: any, res: any) => {
  const { cid, lang, currency, country } = req.body;
  if (!cid || typeof cid !== 'string' || cid.length > 64) {
    return res.status(400).json({ error: 'Missing or invalid cid' });
  }
  if (!guestDb) {
    return res.status(503).json({ error: 'Database not ready' });
  }
  try {
    await guestDb.createBookingSession({
      gaClientId: cid,
      language:   lang     ?? null,
      currency:   currency ?? null,
      country:    country  ?? null,
    });
    await guestDb.cleanupOldSessions();
    res.json({ ok: true });
  } catch (err: any) {
    console.error('[track-session] DB error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Manual email check endpoint (admin only)
app.post('/api/check-emails', requireAdminKey, async (req, res) => {
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
        description: 'Manually trigger email check (requires X-Admin-Key header)',
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
    const { page, limit, subscribed, source, search, country } = req.query;
    const result = await guestDb.getGuests({
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 50,
      subscribed: subscribed === 'true' ? true : subscribed === 'false' ? false : undefined,
      source: source as string | undefined,
      search: search as string | undefined,
      country: country as string | undefined,
    });
    const stats = await guestDb.getGuestStats();
    res.json({ ...result, stats });
  } catch (err: any) {
    const pg = err.cause ?? err;
    res.status(500).json({
      error: err.message,
      detail: pg.message !== err.message ? pg.message : (pg.detail ?? pg.code ?? undefined),
    });
  }
});

// GET /api/admin/guests/export/google  — Google Customer Match CSV
app.get('/api/admin/guests/export/google', requireAdminKey, async (req: any, res: any) => {
  if (!guestDb) return res.status(503).json({ error: 'Database not initialised' });
  try {
    const contacts = await guestDb.getSubscribedGuests();
    const sanitizeCsvField = (value: string): string => {
      const stripped = value.replace(/"/g, '');
      if (/^[=+\-@\t\r]/.test(stripped)) {
        return '\t' + stripped;
      }
      return stripped;
    };
    const lines = ['Email Address,First Name,Last Name'];
    for (const c of contacts) {
      const email = c.email.toLowerCase().trim();
      const first = sanitizeCsvField(c.firstName || '');
      const last = sanitizeCsvField(c.lastName || '');
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

  // Inline header image attachment — same CID used by all transactional emails
  const headerAttachment = {
    filename: 'email-header.jpg',
    path: './email_templates/assets/email-header.jpg',
    cid: 'email-header-image',
  };

  // Test-send mode — send only to testEmail and return immediately
  if (testEmail) {
    // Replace {{firstname}} with a visible placeholder so the admin sees how personalisation looks
    const testPersonalised = html.replace(/\{\{firstname\}\}/gi, '[Firstname]');
    const testHtml = testPersonalised + `<br><br><hr style="border:none;border-top:1px solid #eee"><p style="font-size:11px;color:#999;text-align:center">Test send — unsubscribe link placeholder</p>`;
    await transporter.sendMail({ from: `"${fromName}" <${fromEmail}>`, to: testEmail, subject: `[TEST] ${subject}`, html: testHtml, attachments: [headerAttachment] });
    return res.json({ success: true, mode: 'test', sent: 1 });
  }

  // Live broadcast — start async, return immediately
  const recipients = await guestDb.getSubscribedGuests();
  res.json({ success: true, mode: 'live', queued: recipients.length });

  // Fire-and-forget
  (async () => {
    let sent = 0;
    let failed = 0;
    const total = recipients.length;
    console.log(`📧 Broadcast started: ${total} recipients, subject: "${subject}"`);
    for (let i = 0; i < total; i++) {
      const r = recipients[i];
      try {
        const token = r.unsubscribeToken || crypto.randomUUID();
        const unsubUrl = `${baseUrl}/unsubscribe/${token}`;
        const footer = `<br><br><hr style="border:none;border-top:1px solid #eee"><p style="font-size:11px;color:#999;text-align:center">You are receiving this because you stayed at DEVOCEAN Lodge.<br><a href="${unsubUrl}" style="color:#9e4b13">Unsubscribe</a></p>`;
        const personalised = html.replace(/\{\{firstname\}\}/gi, r.firstName?.trim() || '');
        await transporter.sendMail({ from: `"${fromName}" <${fromEmail}>`, to: r.email, subject, html: personalised + footer, attachments: [headerAttachment] });
        sent++;
      } catch (e: any) {
        failed++;
        console.error(`📧 Broadcast error for ${r.email}: ${e?.message || e}`);
      }
      if ((i + 1) % 10 === 0 || i + 1 === total) {
        console.log(`📧 Broadcast progress: ${i + 1} / ${total} processed (${sent} sent, ${failed} failed)`);
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    console.log(`📧 Broadcast complete: ${sent} sent, ${failed} failed out of ${total}`);
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

// ─── Admin: discount codes (reusable phrase-discount codes for /book-direct) ─
app.get('/api/admin/discount-codes', requireAdminKey, async (req: any, res: any) => {
  if (!guestDb) return res.status(503).json({ error: 'Database not initialised' });
  try {
    const codes = await guestDb.listDiscountCodes();
    res.json({ coupons: codes }); // keep key "coupons" for AdminPage backwards compat
  } catch (err: any) {
    console.error('[ADMIN] list discount codes error:', err.message);
    res.status(500).json({ error: 'Could not load discount codes' });
  }
});

app.post('/api/admin/discount-codes', requireAdminKey, async (req: any, res: any) => {
  if (!guestDb) return res.status(503).json({ error: 'Database not initialised' });
  const code = String(req.body?.code || '').trim();
  const type = req.body?.type;
  const value = Number(req.body?.value);
  if (!code) return res.status(400).json({ error: 'Discount code is required' });
  if (type !== 'percent' && type !== 'fixed') {
    return res.status(400).json({ error: 'type must be "percent" or "fixed"' });
  }
  if (!Number.isFinite(value) || value <= 0) {
    return res.status(400).json({ error: 'value must be a positive number' });
  }
  if (type === 'percent' && value > 100) {
    return res.status(400).json({ error: 'A percent discount cannot exceed 100' });
  }
  const parseOptionalDate = (v: unknown): Date | null => {
    if (!v || typeof v !== 'string' || !v.trim()) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  };
  const validFrom  = parseOptionalDate(req.body?.validFrom);
  const validUntil = parseOptionalDate(req.body?.validUntil);
  if (validFrom && validUntil && validFrom >= validUntil) {
    return res.status(400).json({ error: '"Valid from" must be before "Valid until"' });
  }
  try {
    const coupon = await guestDb.createDiscountCode({ code, type, value, validFrom, validUntil });
    res.json({ coupon });
  } catch (err: any) {
    console.error('[ADMIN] create discount code error:', err.message);
    res.status(500).json({ error: 'Could not save discount code' });
  }
});

app.post('/api/admin/discount-codes/:code/deactivate', requireAdminKey, async (req: any, res: any) => {
  if (!guestDb) return res.status(503).json({ error: 'Database not initialised' });
  try {
    const coupon = await guestDb.setDiscountCodeActive(req.params.code, false);
    if (!coupon) return res.status(404).json({ error: 'Discount code not found' });
    res.json({ coupon });
  } catch (err: any) {
    console.error('[ADMIN] deactivate discount code error:', err.message);
    res.status(500).json({ error: 'Could not deactivate discount code' });
  }
});

app.post('/api/admin/discount-codes/:code/activate', requireAdminKey, async (req: any, res: any) => {
  if (!guestDb) return res.status(503).json({ error: 'Database not initialised' });
  try {
    const coupon = await guestDb.setDiscountCodeActive(req.params.code, true);
    if (!coupon) return res.status(404).json({ error: 'Discount code not found' });
    res.json({ coupon });
  } catch (err: any) {
    console.error('[ADMIN] activate discount code error:', err.message);
    res.status(500).json({ error: 'Could not activate discount code' });
  }
});

// ─── Gift voucher checkout (create Stripe session for purchaser) ──────────
app.post('/api/gift-voucher/checkout', requireAdminKey, async (req: any, res: any) => {
  const VALID_AMOUNTS = [20, 50, 100, 200, 500];
  const amount = Number(req.body?.amount);
  const purchaserEmail = String(req.body?.purchaserEmail || '').trim();
  const purchaserName = String(req.body?.purchaserName || '').trim();
  const recipientName = String(req.body?.recipientName || '').trim() || undefined;
  const message = String(req.body?.message || '').trim().slice(0, 500) || undefined;

  if (!VALID_AMOUNTS.includes(amount)) {
    return res.status(400).json({ error: 'Invalid amount. Choose $20, $50, $100, $200, or $500.' });
  }
  if (!purchaserEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(purchaserEmail)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }
  if (!purchaserName) return res.status(400).json({ error: 'Your name is required.' });

  try {
    const { createGiftVoucherCheckoutSession } = await import('./server/services/stripe-booking');
    const { url, stripeSessionId } = await createGiftVoucherCheckoutSession({
      amount, purchaserEmail, purchaserName, recipientName, message,
    });
    if (guestDb) {
      await guestDb.createGiftVoucher({ amountUsd: amount, purchaserEmail, purchaserName, recipientName, message, stripeSessionId });
    }
    res.json({ url });
  } catch (err: any) {
    console.error('[GIFT_VOUCHER] checkout error:', err.message);
    res.status(500).json({ error: 'Could not create checkout. Please try again.' });
  }
});

// ─── Gift voucher confirm (poll after Stripe redirect) ───────────────────
app.get('/api/gift-voucher/confirm/:sessionId', requireAdminKey, async (req: any, res: any) => {
  if (!guestDb) return res.status(503).json({ error: 'Database not available' });
  try {
    const voucher = await guestDb.getGiftVoucherByStripeSession(String(req.params.sessionId));
    if (!voucher) return res.status(404).json({ error: 'Voucher not found' });
    res.json({
      status: voucher.status,
      code: (voucher.status === 'active' || voucher.status === 'redeemed') ? voucher.code : null,
      amountUsd: Number(voucher.amountUsd),
      purchaserName: voucher.purchaserName || null,
      recipientName: voucher.recipientName || null,
      expiresAt: voucher.expiresAt,
    });
  } catch (err: any) {
    console.error('[GIFT_VOUCHER] confirm error:', err.message);
    res.status(500).json({ error: 'Could not load voucher details.' });
  }
});

// ─── Gift voucher validate (from /book-direct voucher input) ─────────────
app.get('/api/gift-voucher/validate', requireAdminKey, async (req: any, res: any) => {
  if (!guestDb) return res.status(503).json({ error: 'Database not available' });
  const code = String(req.query.code || '').trim().toUpperCase();
  if (!code) return res.status(400).json({ error: 'code is required' });
  try {
    const voucher = await guestDb.getActiveGiftVoucherByCode(code);
    if (!voucher) return res.json({ valid: false, error: 'This voucher code is not valid.' });
    if (new Date(voucher.expiresAt) < new Date()) {
      return res.json({ valid: false, error: 'This voucher has expired.' });
    }
    res.json({ valid: true, amountUsd: Number(voucher.amountUsd), code: voucher.code });
  } catch (err: any) {
    console.error('[GIFT_VOUCHER] validate error:', err.message);
    res.json({ valid: false, error: 'Could not validate voucher.' });
  }
});

// ─── Admin: list all gift vouchers ───────────────────────────────────────────
app.get('/api/admin/gift-vouchers', requireAdminKey, async (req: any, res: any) => {
  if (!guestDb) return res.status(503).json({ error: 'Database not initialised' });
  try {
    const vouchers = await guestDb.listAllGiftVouchers();
    res.json({ vouchers });
  } catch (err: any) {
    console.error('[ADMIN] list gift vouchers error:', err.message);
    res.status(500).json({ error: 'Could not load gift vouchers' });
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

// Native direct-booking API (availability/checkout/result + Stripe webhook)
app.use('/api/booking', createBookingRouter({ db: guestDb, requireAdminKey, emailService }));

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
