import 'dotenv/config';
import { DatabaseService } from './server/services/database.js';
import { EmailParser } from './server/services/email-parser.js';
import { EmailSchedulerService } from './server/services/email-scheduler.js';
import imaps from 'imap-simple';

console.log('📧 Processing booking email...\n');

// Connect to IMAP
const config = {
  imap: {
    user: process.env.IMAP_USER,
    password: process.env.IMAP_PASSWORD,
    host: process.env.IMAP_HOST || process.env.MAIL_HOST,
    port: 993,
    tls: true,
    authTimeout: 10000,
    tlsOptions: { rejectUnauthorized: false }
  }
};

try {
  // Initialize database
  console.log('📊 Connecting to database...');
  const db = new DatabaseService(process.env.DATABASE_URL);
  const scheduler = new EmailSchedulerService(db);
  
  // Connect to IMAP
  console.log('📬 Connecting to IMAP...');
  const connection = await imaps.connect(config);
  console.log('✅ Connected');
  
  // Open INBOX
  await connection.openBox('INBOX');
  console.log('✅ INBOX opened');
  
  // Search for unseen emails
  const searchCriteria = ['UNSEEN'];
  const fetchOptions = {
    bodies: ['HEADER', 'TEXT'],
    markSeen: false
  };
  
  const messages = await connection.search(searchCriteria, fetchOptions);
  console.log(`\n📨 Found ${messages.length} unseen email(s)`);
  
  if (messages.length === 0) {
    console.log('No emails to process');
    connection.end();
    process.exit(0);
  }
  
  // Process first email
  const message = messages[0];
  console.log('\n🔍 Parsing booking email...');
  
  // Extract email content
  const textPart = message.parts.find(part => part.which === 'TEXT');
  const emailContent = textPart?.body || '';
  
  const booking = await EmailParser.parseBookingEmail(emailContent);
  
  console.log('\n✅ Parsed booking:');
  console.log(JSON.stringify(booking, null, 2));
  
  // Store booking in database
  console.log('\n💾 Storing booking in database...');
  const savedBooking = await db.createBooking(booking);
  console.log('✅ Booking saved with ID:', savedBooking.id);
  
  // Schedule emails
  console.log('\n📅 Scheduling automated emails...');
  await scheduler.scheduleEmailsForBooking(savedBooking);
  console.log('✅ Emails scheduled');
  
  // Mark email as seen
  await connection.addFlags(message.attributes.uid, '\\Seen');
  console.log('\n✉️  Email marked as processed');
  
  connection.end();
  console.log('\n🎉 Booking processed successfully!');
  
  process.exit(0);
} catch (error) {
  console.error('\n❌ Error processing booking:');
  console.error(error);
  process.exit(1);
}
