import { DatabaseService } from './database';
import { EmailParser } from './email-parser';
import nodemailer from 'nodemailer';
import { emailTemplateRenderer } from './email-template-renderer';

/**
 * Cancellation Handler Service
 * Processes cancellation emails and stops scheduled emails
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

export class CancellationHandler {
  private db: DatabaseService;
  private transporter?: nodemailer.Transporter;
  private fromEmail: string;

  constructor(db: DatabaseService, smtpConfig?: SMTPConfig, fromEmail: string = 'booking@devoceanlodge.com') {
    this.db = db;
    if (smtpConfig) {
      this.transporter = nodemailer.createTransport(smtpConfig);
    }
    this.fromEmail = fromEmail;
  }

  /**
   * Parse and process a cancellation email
   */
  async processCancellationEmail(emailContent: string, rawData?: any): Promise<boolean> {
    try {
      // Check if this is a cancellation email
      if (!this.isCancellationEmail(emailContent)) {
        return false;
      }

      // Extract booking reference from cancellation email
      const groupRef = this.extractGroupRef(emailContent);
      if (!groupRef) {
        console.error('No group reference found in cancellation email');
        return false;
      }

      // Find the booking in database
      const booking = await this.db.getBookingByGroupRef(groupRef);
      
      if (!booking) {
        // Booking doesn't exist yet - store as pending cancellation
        const reason = this.extractCancellationReason(emailContent);
        await this.db.storePendingCancellation(groupRef, reason, rawData);
        console.log(`📋 Stored pending cancellation for booking ${groupRef} (booking not yet received)`);
        return true;
      }

      // Booking exists - process cancellation immediately
      const reason = this.extractCancellationReason(emailContent);
      await this.cancelBooking(groupRef, reason);

      console.log(`✅ Cancelled booking ${groupRef} and stopped scheduled emails`);
      return true;
    } catch (error) {
      console.error('Error processing cancellation email:', error);
      return false;
    }
  }

  /**
   * Cancel a booking and stop all scheduled emails
   */
  async cancelBooking(groupRef: string, reason?: string): Promise<void> {
    const booking = await this.db.getBookingByGroupRef(groupRef);
    if (!booking) {
      throw new Error(`Booking ${groupRef} not found`);
    }

    // Update booking status to cancelled
    await this.db.cancelBooking(booking.id, reason);

    // Cancel all pending scheduled emails for this booking
    await this.db.cancelScheduledEmailsForBooking(booking.id);

    // Send cancellation confirmation email to guest
    if (this.transporter) {
      await this.sendCancellationEmail(booking, reason);
    }

    console.log(`Booking ${groupRef} cancelled, ${reason ? `Reason: ${reason}` : 'No reason provided'}`);
  }

  /**
   * Send cancellation confirmation email to guest
   */
  private async sendCancellationEmail(booking: any, reason?: string): Promise<void> {
    try {
      // Render email using template renderer
      const emailData = {
        guestName: booking.guestName || 'Guest',
        groupRef: booking.groupRef,
        checkInDate: this.formatDate(booking.checkInDate),
        checkOutDate: this.formatDate(booking.checkOutDate),
        cancelDate: this.formatDate(new Date()),
      };

      const rendered = emailTemplateRenderer.render(
        'cancellation',
        booking.guestLanguage || 'en-GB',
        emailData
      );

      // Send email
      await this.transporter!.sendMail({
        from: this.fromEmail,
        to: booking.guestEmail,
        subject: rendered.subject,
        html: rendered.html,
      });

      console.log(`✅ Cancellation confirmation email sent to ${booking.guestEmail} (${booking.guestLanguage || 'en-GB'})`);
    } catch (error) {
      console.error('Error sending cancellation email:', error);
    }
  }

  /**
   * Format date for email display
   */
  private formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Check if email is a cancellation notification
   */
  private isCancellationEmail(text: string): boolean {
    const cancellationKeywords = [
      'cancellation',
      'cancelled',
      'canceled',
      'booking cancelled',
      'reservation cancelled',
      'cancellation notification',
    ];

    const lowerText = text.toLowerCase();
    return cancellationKeywords.some(keyword => lowerText.includes(keyword));
  }

  /**
   * Extract group reference from cancellation email
   */
  private extractGroupRef(text: string): string | null {
    // Try to extract group reference
    const groupRefMatch = text.match(/Group Ref:\s*(\d+)/i) || 
                         text.match(/Booking Ref:\s*(\d+)/i) ||
                         text.match(/Reference:\s*(\d+)/i);
    
    return groupRefMatch ? groupRefMatch[1] : null;
  }

  /**
   * Extract cancellation reason from email
   */
  private extractCancellationReason(text: string): string | undefined {
    // Try to find reason in email
    const reasonMatch = text.match(/Reason:\s*([^\n]+)/i) ||
                       text.match(/Cancellation reason:\s*([^\n]+)/i);
    
    return reasonMatch ? reasonMatch[1].trim() : 'Guest cancellation';
  }
}
