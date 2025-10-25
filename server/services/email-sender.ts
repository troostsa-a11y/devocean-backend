import { Resend } from 'resend';
import { DatabaseService } from './database';
import type { ScheduledEmail } from '../../shared/schema';
import { getEmailTemplate } from './email-templates';

/**
 * Email Sender Service
 * Sends transactional emails via Resend
 */

export class EmailSenderService {
  private resend: Resend;
  private db: DatabaseService;
  private fromEmail: string;

  constructor(apiKey: string, db: DatabaseService, fromEmail: string = 'booking@devoceanlodge.com') {
    this.resend = new Resend(apiKey);
    this.db = db;
    this.fromEmail = fromEmail;
  }

  /**
   * Send a scheduled email
   */
  async sendScheduledEmail(scheduledEmail: ScheduledEmail): Promise<boolean> {
    try {
      // Get email template
      const template = getEmailTemplate(
        scheduledEmail.emailType as any,
        scheduledEmail.language,
        scheduledEmail.templateData || {}
      );

      // Send email via Resend
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: scheduledEmail.recipientEmail,
        subject: template.subject,
        html: template.html,
      });

      if (result.error) {
        throw new Error(result.error.message);
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
        provider: 'resend',
        messageId: result.data?.id,
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
        provider: 'resend',
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
