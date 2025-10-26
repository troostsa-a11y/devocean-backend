import 'dotenv/config';
import express from 'express';
import { EmailAutomationService } from './server/services/email-automation.js';

/**
 * DEVOCEAN Lodge Email Automation Server
 * Automatically processes Beds24 booking notifications and sends scheduled emails
 */

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

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
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`  - ${key}`));
    console.error('\nPlease add these secrets to Replit Secrets');
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
    
    // SMTP config for sending emails (uses shared MAIL_* and separate IMAP_* secrets)
    const smtpConfig = {
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.IMAP_USER,
        pass: process.env.IMAP_PASSWORD,
      },
    };
    
    // IMAP config for reading emails (uses shared MAIL_HOST and MAIL_PORT)
    const imapConfig = {
      host: process.env.IMAP_HOST || process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT),
      user: process.env.IMAP_USER,
      password: process.env.IMAP_PASSWORD,
      tls: process.env.IMAP_TLS === 'true',
    };
    
    emailService = new EmailAutomationService(
      process.env.DATABASE_URL,
      smtpConfig,
      imapConfig,
      taxiConfig,
      adminEmail
    );

    if (taxiConfig) {
      console.log(`📧 Transfer notifications enabled for ${taxiConfig.name}`);
    }

    console.log(`📊 Admin reports enabled for ${adminEmail}`);

    // Start the automated email checking
    emailService.start();
    console.log('✅ Email automation service started successfully');
    console.log('📧 Checking emails at 08:00, 14:00, 22:00 UTC daily');
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
    },
    schedule: {
      frequency: '3 times daily',
      times: ['08:00 UTC', '14:00 UTC', '22:00 UTC'],
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
  console.log(`📅 Email checks scheduled for 08:00, 14:00, 22:00 UTC`);
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
