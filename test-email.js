/**
 * Test Email Script
 * Sends a sample post-booking email to admin@devoceanlodge.com
 */

import 'dotenv/config';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

/**
 * Simple template renderer (JavaScript version)
 */
function renderTemplate(emailType, language, data) {
  // Load translations
  const translationsPath = path.join(process.cwd(), 'email_templates', 'translations', 'email-translations.json');
  const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf-8'));
  
  // Get language code with fallback
  const langCode = translations[language] ? language : 'en-GB';
  
  // Load template
  const templatePath = path.join(process.cwd(), 'email_templates', 'base', `${emailType}.html`);
  let template = fs.readFileSync(templatePath, 'utf-8');
  
  // Get translations for this email type
  const t = translations[langCode][emailType];
  
  // Build replacement data
  const allReplacements = {};
  
  // Add translation keys with 't.' prefix
  for (const [key, value] of Object.entries(t)) {
    allReplacements[`t.${key}`] = value;
  }
  
  // Add data keys
  for (const [key, value] of Object.entries(data)) {
    allReplacements[key] = String(value);
  }
  
  // Add language code
  allReplacements['lang'] = langCode.split('-')[0] || 'en';
  
  // Replace placeholders (multiple passes for nested placeholders)
  let html = template;
  let previousHtml = '';
  let iterations = 0;
  
  while (html !== previousHtml && iterations < 10) {
    previousHtml = html;
    
    html = html.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const value = allReplacements[key];
      return value !== undefined ? value : match;
    });
    
    iterations++;
  }
  
  return {
    subject: t.subject || 'DEVOCEAN Lodge',
    html,
  };
}

async function sendTestEmail() {
  console.log('🧪 Preparing to send test email...\n');

  // Validate required environment variables
  const required = ['MAIL_HOST', 'MAIL_PORT', 'IMAP_USER', 'IMAP_PASSWORD'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`  - ${key}`));
    process.exit(1);
  }

  // Setup SMTP transporter
  const port = parseInt(process.env.MAIL_PORT);
  const smtpConfig = {
    host: process.env.MAIL_HOST,
    port: port,
    // Port 465 always uses secure, port 587 uses STARTTLS
    secure: port === 465 ? true : (process.env.MAIL_SECURE === 'true'),
    auth: {
      user: process.env.IMAP_USER,
      pass: process.env.IMAP_PASSWORD,
    },
    // Add connection timeout
    connectionTimeout: 10000,
  };

  console.log(`📧 SMTP Config:`);
  console.log(`   Host: ${smtpConfig.host}`);
  console.log(`   Port: ${smtpConfig.port}`);
  console.log(`   Secure: ${smtpConfig.secure}`);
  console.log(`   User: ${smtpConfig.auth.user}\n`);

  const transporter = nodemailer.createTransport(smtpConfig);

  // Verify SMTP connection
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified\n');
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    process.exit(1);
  }

  // Sample booking data
  const sampleData = {
    guestName: 'John Smith',
    checkInDate: 'Saturday, 15 February 2025',
    checkOutDate: 'Friday, 21 February 2025',
  };

  // Test all 4 languages
  const languages = [
    { code: 'en-GB', name: 'UK English' },
    { code: 'en-US', name: 'US English' },
    { code: 'pt-PT', name: 'Portugal Portuguese' },
    { code: 'pt-BR', name: 'Brazilian Portuguese' },
  ];

  console.log('📝 Rendering templates for 4 languages...\n');
  
  for (const lang of languages) {
    try {
      const { subject, html } = renderTemplate('post_booking', lang.code, sampleData);
      
      console.log(`✅ ${lang.name} (${lang.code})`);
      console.log(`   Subject: ${subject}`);
      console.log(`   HTML length: ${html.length} characters\n`);
      
      // Send the email (only first language to avoid spam)
      if (lang.code === 'en-GB') {
        console.log(`📨 Sending test email to admin@devoceanlodge.com...\n`);
        
        const fromEmail = process.env.IMAP_FROM_EMAIL || 'booking@devoceanlodge.com';
        const fromName = process.env.IMAP_FROM_NAME || 'DEVOCEAN Lodge Bookings';
        
        const result = await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: 'admin@devoceanlodge.com',
          subject: `[TEST] ${subject}`,
          html: html,
        });

        console.log('✅ Email sent successfully!');
        console.log(`   Message ID: ${result.messageId}`);
        console.log(`   From: ${fromName} <${fromEmail}>`);
        console.log(`   To: admin@devoceanlodge.com`);
        console.log(`   Subject: [TEST] ${subject}\n`);
      }
    } catch (error) {
      console.error(`❌ Error with ${lang.name}:`, error.message);
    }
  }

  console.log('🎉 Test complete!\n');
  console.log('Check admin@devoceanlodge.com for the test email.');
  console.log('Subject line will start with [TEST] to identify it as a test.\n');
}

// Run the test
sendTestEmail().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
