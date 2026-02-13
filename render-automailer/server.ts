import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { EmailAutomationService } from './server/services/email-automation';

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
