import { DatabaseService } from './database';

/**
 * Modification Handler Service
 * Processes modification emails by deleting old booking records
 * and allowing the system to treat them as new bookings
 */

export class ModificationHandler {
  private db: DatabaseService;

  constructor(db: DatabaseService) {
    this.db = db;
  }

  /**
   * Parse and process a modification email
   * Returns true if this is a modification email (old booking deleted or not found)
   * Returns false if not a modification email
   * Note: Caller should continue processing as new booking when true is returned
   */
  async processModificationEmail(emailContent: string): Promise<boolean> {
    try {
      // Check if this is a modification email
      if (!this.isModificationEmail(emailContent)) {
        return false;
      }

      // Extract booking reference from modification email
      const groupRef = this.extractGroupRef(emailContent);
      if (!groupRef) {
        console.error('No group reference found in modification email');
        return true; // Return true because it IS a modification email, even if we can't process it
      }

      // Find the booking in database
      const booking = await this.db.getBookingByGroupRef(groupRef);
      
      if (!booking) {
        // Booking doesn't exist yet - this is fine, just parse as new booking
        console.log(`📋 Modification email for booking ${groupRef} received before original booking - will be processed as new`);
        return true; // Return true because it IS a modification email
      }

      // Booking exists - delete it so the new data can be processed as fresh
      await this.deleteBooking(groupRef);

      console.log(`✅ Deleted old booking ${groupRef} to process modification as new booking`);
      return true; // Return true because it IS a modification email
    } catch (error) {
      console.error('Error processing modification email:', error);
      return false; // On error, let it be processed as normal booking
    }
  }

  /**
   * Delete a booking and all related records (including pending cancellations)
   */
  async deleteBooking(groupRef: string): Promise<void> {
    const booking = await this.db.getBookingByGroupRef(groupRef);
    if (!booking) {
      console.log(`Booking ${groupRef} not found - nothing to delete`);
      return;
    }

    // Cancel all pending scheduled emails for this booking
    await this.db.cancelScheduledEmailsForBooking(booking.id);
    console.log(`Cancelled scheduled emails for booking ${groupRef}`);

    // Delete the booking record
    await this.db.deleteBooking(booking.id);
    console.log(`Deleted booking record for ${groupRef}`);

    // Clear any pending cancellation for this groupRef
    // (prevents recreated booking from being immediately cancelled)
    await this.db.deletePendingCancellation(groupRef);
    console.log(`Cleared pending cancellation for ${groupRef} (if any)`);
  }

  /**
   * Check if email is a modification notification
   */
  private isModificationEmail(text: string): boolean {
    const lowerText = text.toLowerCase();
    
    // Check for modification notification markers
    const modificationMarkers = [
      'modification notification',
      'booking modified',
      'reservation modified',
      'booking has been modified',
      'reservation has been modified',
      'modification of booking',
    ];

    return modificationMarkers.some(marker => lowerText.includes(marker));
  }

  /**
   * Extract group reference from modification email
   * Supports both numeric and alphanumeric references from Beds24
   */
  private extractGroupRef(text: string): string | null {
    // Try to extract group reference - support alphanumeric refs (e.g., A1B2C3)
    const groupRefMatch = text.match(/Group Ref:\s*([A-Z0-9]+)/i) || 
                         text.match(/Booking Ref:\s*([A-Z0-9]+)/i) ||
                         text.match(/Reference:\s*([A-Z0-9]+)/i);
    
    return groupRefMatch ? groupRefMatch[1] : null;
  }
}
