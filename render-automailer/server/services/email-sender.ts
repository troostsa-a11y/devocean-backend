import nodemailer from 'nodemailer';
import { DatabaseService } from './database';
import type { ScheduledEmail } from '../../shared/schema';
import { emailTemplateRenderer } from './email-template-renderer';

/**
 * Email Sender Service
 * Sends transactional emails via SMTP
 * Includes smart retry logic for temporary vs permanent failures
 */

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Maximum retry attempts for temporary errors
const MAX_RETRIES = 3;

// Retry delays in minutes (exponential backoff: 15min, 30min, 60min)
const RETRY_DELAYS_MINUTES = [15, 30, 60];

/**
 * Classify email sending errors as temporary or permanent
 * - Temporary: Network issues, timeouts, server busy (should retry)
 * - Permanent: Invalid address, auth failure, missing files (don't retry)
 */
type ErrorClassification = 'temporary' | 'permanent';

function classifyEmailError(error: any): ErrorClassification {
  const errorCode = error?.code || '';
  const errorMessage = (error?.message || '').toLowerCase();
  const responseCode = error?.responseCode || 0;

  // PERMANENT errors - don't retry
  const permanentCodes = [
    'EENVELOPE',      // Invalid envelope (bad address format)
    'EADDRESS',       // Invalid email address
    'EAUTH',          // Authentication failed
    'ENOENT',         // File not found (missing template/attachment)
  ];

  const permanentSmtpCodes = [
    550,  // Mailbox not found / User unknown
    551,  // User not local
    552,  // Message too large
    553,  // Invalid mailbox name
    554,  // Transaction failed (permanent)
    535,  // Authentication failed
  ];

  const permanentPatterns = [
    'invalid recipient',
    'user unknown',
    'mailbox not found',
    'address rejected',
    'authentication failed',
    'no such file',
    'template not found',
    'no translations found',
    'enoent',
  ];

  // Check for permanent error codes
  if (permanentCodes.includes(errorCode)) {
    return 'permanent';
  }

  // Check for permanent SMTP response codes
  if (permanentSmtpCodes.includes(responseCode)) {
    return 'permanent';
  }

  // Check for permanent error patterns in message
  for (const pattern of permanentPatterns) {
    if (errorMessage.includes(pattern)) {
      return 'permanent';
    }
  }

  // TEMPORARY errors - should retry
  const temporaryCodes = [
    'ETIMEDOUT',      // Connection timeout
    'ECONNRESET',     // Connection reset
    'ECONNREFUSED',   // Connection refused
    'EHOSTUNREACH',   // Host unreachable
    'ENOTFOUND',      // DNS lookup failed
    'ESOCKET',        // Socket error
    'ESTREAM',        // Stream error (can be temporary)
  ];

  const temporarySmtpCodes = [
    421,  // Service not available, try again later
    450,  // Mailbox busy, try again later
    451,  // Local error, try again later
    452,  // Insufficient storage, try again later
  ];

  const temporaryPatterns = [
    'timeout',
    'timed out',
    'try again',
    'temporarily',
    'connection closed',
    'socket hang up',
    'network',
    'busy',
    'rate limit',
    'too many connections',
  ];

  // Check for temporary error codes
  if (temporaryCodes.includes(errorCode)) {
    return 'temporary';
  }

  // Check for temporary SMTP response codes
  if (temporarySmtpCodes.includes(responseCode)) {
    return 'temporary';
  }

  // Check for temporary error patterns in message
  for (const pattern of temporaryPatterns) {
    if (errorMessage.includes(pattern)) {
      return 'temporary';
    }
  }

  // Default: treat unknown errors as temporary (give them a chance to retry)
  // But only if it looks like a network/connection issue
  if (errorCode.startsWith('E') && !permanentCodes.includes(errorCode)) {
    return 'temporary';
  }

  // For truly unknown errors, mark as permanent to avoid infinite retries
  return 'permanent';
}

export class EmailSenderService {
  private transporter: ReturnType<typeof nodemailer.createTransport>;
  private db: DatabaseService;
  private fromEmail: string;
  private fromName: string;
  private bccEmail?: string;

  constructor(
    smtpConfig: SMTPConfig,
    db: DatabaseService,
    fromEmail: string = 'booking@devoceanlodge.com',
    fromName: string = 'DEVOCEAN Lodge Bookings',
    bccEmail?: string
  ) {
    this.transporter = nodemailer.createTransport(smtpConfig);
    this.db = db;
    this.fromEmail = fromEmail;
    this.fromName = fromName;
    this.bccEmail = bccEmail;
  }

  /**
   * Send a scheduled email
   */
  async sendScheduledEmail(scheduledEmail: ScheduledEmail): Promise<boolean> {
    try {
      // Safety check: Verify booking isn't cancelled before sending
      // EXCEPTION: Cancellation emails should always be sent even if booking is cancelled
      // Also enrich templateData with fresh firstName and gender from booking
      let enrichedTemplateData: Record<string, any> = scheduledEmail.templateData || {};
      
      if (scheduledEmail.bookingId) {
        const booking = await this.db.getBookingById(scheduledEmail.bookingId);
        
        // Skip cancelled bookings EXCEPT for cancellation confirmation emails
        if (!booking || (booking.status === 'cancelled' && scheduledEmail.emailType !== 'cancellation')) {
          console.log(`⚠️ Skipping email ${scheduledEmail.id} - booking ${scheduledEmail.bookingId} is cancelled`);
          await this.db.markEmailAsCancelled(scheduledEmail.id);
          return false;
        }
        
        // Enrich templateData with fresh firstName and gender from current booking data
        enrichedTemplateData = {
          ...enrichedTemplateData,
          firstName: booking.firstName || enrichedTemplateData.firstName || 'Guest',
          gender: booking.guestGender || enrichedTemplateData.gender,
        };
      }

      // Get email template using HTML template renderer
      const template = emailTemplateRenderer.render(
        scheduledEmail.emailType,
        scheduledEmail.language,
        enrichedTemplateData
      );

      // Build attachments array - always include header image
      const attachments: any[] = [
        {
          filename: 'email-header.jpg',
          path: './email_templates/assets/email-header.jpg',
          cid: 'email-header-image' // Content-ID for referencing in HTML
        }
      ];

      // Add QR codes for post_departure emails
      if (scheduledEmail.emailType === 'post_departure') {
        attachments.push(
          {
            filename: 'qr-booking.png',
            path: './email_templates/assets/qr-booking.png',
            cid: 'qr-booking'
          },
          {
            filename: 'qr-google.png',
            path: './email_templates/assets/qr-google.png',
            cid: 'qr-google'
          },
          {
            filename: 'qr-tripadvisor.png',
            path: './email_templates/assets/qr-tripadvisor.png',
            cid: 'qr-tripadvisor'
          }
        );
      }

      // Send email via SMTP with inline attachments
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: scheduledEmail.recipientEmail,
        bcc: this.bccEmail, // BCC copy for record-keeping
        subject: template.subject,
        html: template.html,
        attachments
      };
      
      // Debug logging to verify BCC
      console.log(`📧 Sending email to ${scheduledEmail.recipientEmail}, BCC: ${this.bccEmail || '(none)'}`);
      
      const result = await this.transporter.sendMail(mailOptions);
      
      // Log SMTP server response to verify BCC was accepted
      console.log(`✅ SMTP Response - Message ID: ${result.messageId}`);
      console.log(`   Accepted: ${JSON.stringify(result.accepted)}`);
      console.log(`   Rejected: ${JSON.stringify(result.rejected)}`);
      if (result.envelope) {
        console.log(`   Envelope: ${JSON.stringify(result.envelope)}`);
      }

      // Mark as sent in database
      await this.db.markEmailAsSent(scheduledEmail.id);

      // Log the send
      await this.db.logEmail({
        scheduledEmailId: scheduledEmail.id,
        to: scheduledEmail.recipientEmail,
        subject: template.subject,
        emailType: scheduledEmail.emailType,
        status: 'sent',
        provider: 'smtp',
        messageId: result.messageId,
      });

      // Update booking email status
      if (scheduledEmail.bookingId) {
        await this.db.updateBookingEmailStatus(
          scheduledEmail.bookingId,
          scheduledEmail.emailType as any
        );
      }

      console.log(`Email sent successfully: ${scheduledEmail.emailType} to ${scheduledEmail.recipientEmail}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorType = classifyEmailError(error);
      const currentRetryCount = await this.db.getEmailRetryCount(scheduledEmail.id);

      console.error(`Error sending email (${errorType}):`, error);

      if (errorType === 'temporary' && currentRetryCount < MAX_RETRIES) {
        // TEMPORARY error - schedule retry with exponential backoff
        const delayMinutes = RETRY_DELAYS_MINUTES[currentRetryCount] || 60;
        const retryAt = new Date(Date.now() + delayMinutes * 60 * 1000);
        
        await this.db.scheduleEmailRetry(scheduledEmail.id, retryAt, errorMessage);
        
        console.log(`🔄 Temporary error - retry ${currentRetryCount + 1}/${MAX_RETRIES} scheduled for ${retryAt.toISOString()}`);
        
        // Log the retry attempt
        await this.db.logEmail({
          scheduledEmailId: scheduledEmail.id,
          to: scheduledEmail.recipientEmail,
          subject: 'Retry scheduled',
          emailType: scheduledEmail.emailType,
          status: 'failed',
          provider: 'smtp',
          errorMessage: `[Retry ${currentRetryCount + 1}/${MAX_RETRIES}] ${errorMessage}`,
        });
      } else {
        // PERMANENT error OR max retries exceeded - mark as failed
        const failReason = errorType === 'permanent' 
          ? `[Permanent error] ${errorMessage}`
          : `[Max retries exceeded] ${errorMessage}`;
        
        await this.db.markEmailAsFailed(scheduledEmail.id, failReason);
        
        if (errorType === 'permanent') {
          console.log(`❌ Permanent error - not retrying: ${errorMessage}`);
        } else {
          console.log(`❌ Max retries (${MAX_RETRIES}) exceeded - giving up`);
        }
        
        // Log the permanent failure
        await this.db.logEmail({
          scheduledEmailId: scheduledEmail.id,
          to: scheduledEmail.recipientEmail,
          subject: 'Failed to send',
          emailType: scheduledEmail.emailType,
          status: 'failed',
          provider: 'smtp',
          errorMessage: failReason,
        });
      }

      return false;
    }
  }

  /**
   * Process all pending emails
   */
  async processPendingEmails(): Promise<{ sent: number; failed: number }> {
    const pendingEmails = await this.db.getPendingScheduledEmails();
    console.log(`Processing ${pendingEmails.length} pending emails`);

    let sent = 0;
    let failed = 0;

    for (const email of pendingEmails) {
      const success = await this.sendScheduledEmail(email);
      if (success) {
        sent++;
      } else {
        failed++;
      }

      // Add a small delay between emails to avoid rate limiting
      await this.delay(500);
    }

    return { sent, failed };
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
