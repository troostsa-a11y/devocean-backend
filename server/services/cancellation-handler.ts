import { DatabaseService } from './database';
import { EmailParser } from './email-parser';

/**
 * Cancellation Handler Service
 * Processes cancellation emails and stops scheduled emails
 */

export class CancellationHandler {
  private db: DatabaseService;

  constructor(db: DatabaseService) {
    this.db = db;
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

    console.log(`Booking ${groupRef} cancelled, ${reason ? `Reason: ${reason}` : 'No reason provided'}`);
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
