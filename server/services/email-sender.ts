import nodemailer from 'nodemailer';
import { DatabaseService } from './database';
import type { ScheduledEmail } from '../../shared/schema';
import { emailTemplateRenderer } from './email-template-renderer';

/**
 * Email Sender Service
 * Sends transactional emails via SMTP
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

export class EmailSenderService {
  private transporter: nodemailer.Transporter;
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
      // Also enrich templateData with fresh firstName and gender from booking
      let enrichedTemplateData: Record<string, any> = scheduledEmail.templateData || {};
      
      if (scheduledEmail.bookingId) {
        const booking = await this.db.getBookingById(scheduledEmail.bookingId);
        if (!booking || booking.status === 'cancelled') {
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
          path: './WebsiteProject/public/images/email-header.jpg',
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
      const result = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: scheduledEmail.recipientEmail,
        bcc: this.bccEmail, // BCC copy for record-keeping
        subject: template.subject,
        html: template.html,
        attachments
      });

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
      console.error(`Error sending email:`, error);

      // Mark as failed
      await this.db.markEmailAsFailed(
        scheduledEmail.id,
        error instanceof Error ? error.message : 'Unknown error'
      );

      // Log the failure
      await this.db.logEmail({
        scheduledEmailId: scheduledEmail.id,
        to: scheduledEmail.recipientEmail,
        subject: 'Failed to send',
        emailType: scheduledEmail.emailType,
        status: 'failed',
        provider: 'smtp',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

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
