import { emailTemplateRenderer } from './server/services/email-template-renderer';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Test script to send an automailer email template
 * Usage: tsx test-automailer-email.ts
 */

async function sendTestEmail() {
  try {
    console.log('🧪 Preparing test automailer email...');

    // Configure SMTP (same as automailer)
    const smtpConfig = {
      host: process.env.MAIL_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.IMAP_USER || '',
        pass: process.env.IMAP_PASSWORD || '',
      },
    };

    console.log(`📮 Using SMTP: ${smtpConfig.host}:${smtpConfig.port}`);

    const transporter = nodemailer.createTransport(smtpConfig);

    // Test data for post_booking email
    const testData = {
      firstName: 'Test Guest',
      gender: null,
      bookingRef: 'TEST123',
      arrivalDate: '2025-12-01',
      departureDate: '2025-12-05',
      checkInDate: '01 December 2025',
      checkOutDate: '05 December 2025',
      nights: '4',
      roomType: 'Deluxe Ocean View',
      guests: '2 adults',
    };

    // Render the email template
    const template = emailTemplateRenderer.render(
      'post_booking',
      'en-GB',
      testData
    );

    console.log(`📧 Sending test email to beds24@devoceanlodge.com`);
    console.log(`📝 Subject: ${template.subject}`);

    // Build attachments
    const attachments = [
      {
        filename: 'email-header.jpg',
        path: './WebsiteProject/public/images/email-header.jpg',
        cid: 'email-header-image',
      },
    ];

    // Send email
    const result = await transporter.sendMail({
      from: '"DEVOCEAN Lodge Bookings" <booking@devoceanlodge.com>',
      to: 'beds24@devoceanlodge.com',
      subject: `[TEST] ${template.subject}`,
      html: template.html,
      attachments,
    });

    console.log(`✅ Test email sent successfully!`);
    console.log(`📬 Message ID: ${result.messageId}`);
    console.log(`\n🔍 Check beds24@devoceanlodge.com inbox for the test email.`);

  } catch (error) {
    console.error('❌ Error sending test email:', error);
    process.exit(1);
  }
}

sendTestEmail();
