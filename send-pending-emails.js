import 'dotenv/config';
import { DatabaseService } from './server/services/database.js';
import { EmailSenderService } from './server/services/email-sender.js';

console.log('📧 Sending pending emails...\n');

try {
  // Initialize services
  const db = new DatabaseService(process.env.DATABASE_URL);
  
  const smtpConfig = {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.IMAP_USER,
      pass: process.env.IMAP_PASSWORD,
    },
  };
  
  const emailSender = new EmailSenderService(smtpConfig, db);
  
  // Get pending emails
  console.log('🔍 Checking for pending emails...');
  const pendingEmails = await db.getPendingScheduledEmails();
  
  console.log(`Found ${pendingEmails.length} pending email(s)\n`);
  
  if (pendingEmails.length === 0) {
    console.log('No pending emails to send');
    process.exit(0);
  }
  
  // Send each pending email
  for (const scheduledEmail of pendingEmails) {
    console.log(`📨 Sending ${scheduledEmail.emailType} email to booking ${scheduledEmail.bookingId}...`);
    
    try {
      await emailSender.sendScheduledEmail(scheduledEmail);
      console.log(`✅ Email sent successfully\n`);
    } catch (error) {
      console.error(`❌ Failed to send email:`, error.message);
      console.error(error);
    }
  }
  
  console.log('🎉 Done!');
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
