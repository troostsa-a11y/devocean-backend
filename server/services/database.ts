import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { bookings, scheduledEmails, emailLogs, emailCheckLogs, pendingCancellations } from '../../shared/schema';
import type { InsertBooking, InsertScheduledEmail, Booking, ScheduledEmail } from '../../shared/schema';
import { eq, and, lte, gte, isNull, sql } from 'drizzle-orm';

/**
 * Database Service
 * Handles all database operations for the email automation system
 */

export class DatabaseService {
  private db: ReturnType<typeof drizzle>;
  private client: ReturnType<typeof postgres>;

  constructor(connectionString: string) {
    this.client = postgres(connectionString);
    this.db = drizzle(this.client);
  }

  /**
   * Close database connection
   */
  async close() {
    await this.client.end();
  }

  /**
   * Create a new booking
   */
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [created] = await this.db
      .insert(bookings)
      .values(booking as any) // Type assertion needed due to Drizzle type strictness with optional fields
      .returning();
    return created;
  }

  /**
   * Get booking by group reference
   */
  async getBookingByGroupRef(groupRef: string): Promise<Booking | undefined> {
    const [booking] = await this.db
      .select()
      .from(bookings)
      .where(eq(bookings.groupRef, groupRef))
      .limit(1);
    return booking;
  }

  /**
   * Get booking by ID
   */
  async getBookingById(id: number): Promise<Booking | undefined> {
    const [booking] = await this.db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);
    return booking;
  }

  /**
   * Update booking email sent status
   */
  async updateBookingEmailStatus(
    bookingId: number,
    emailType: 'post_booking' | 'pre_arrival' | 'arrival' | 'post_departure'
  ): Promise<void> {
    const statusField = {
      post_booking: 'postBookingEmailSent',
      pre_arrival: 'preArrivalEmailSent',
      arrival: 'arrivalEmailSent',
      post_departure: 'postDepartureEmailSent',
    }[emailType];

    await this.db
      .update(bookings)
      .set({
        [statusField]: true,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));
  }

  /**
   * Create a scheduled email
   */
  async createScheduledEmail(email: InsertScheduledEmail): Promise<ScheduledEmail> {
    const [created] = await this.db
      .insert(scheduledEmails)
      .values(email)
      .returning();
    return created;
  }

  /**
   * Get pending scheduled emails (ready to send)
   */
  async getPendingScheduledEmails(currentTime: Date = new Date()): Promise<ScheduledEmail[]> {
    return await this.db
      .select()
      .from(scheduledEmails)
      .where(
        and(
          eq(scheduledEmails.status, 'pending'),
          lte(scheduledEmails.scheduledFor, currentTime)
        )
      );
  }

  /**
   * Mark scheduled email as sent
   */
  async markEmailAsSent(emailId: number): Promise<void> {
    await this.db
      .update(scheduledEmails)
      .set({
        status: 'sent',
        sentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(scheduledEmails.id, emailId));
  }

  /**
   * Mark scheduled email as failed
   */
  async markEmailAsFailed(emailId: number, errorMessage: string): Promise<void> {
    // First get current retry count
    const [email] = await this.db
      .select({ retryCount: scheduledEmails.retryCount })
      .from(scheduledEmails)
      .where(eq(scheduledEmails.id, emailId))
      .limit(1);

    await this.db
      .update(scheduledEmails)
      .set({
        status: 'failed',
        errorMessage,
        retryCount: (email?.retryCount || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(scheduledEmails.id, emailId));
  }

  /**
   * Mark scheduled email as cancelled (booking was cancelled)
   */
  async markEmailAsCancelled(emailId: number): Promise<void> {
    await this.db
      .update(scheduledEmails)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(scheduledEmails.id, emailId));
  }

  /**
   * Get scheduled emails for a booking
   */
  async getScheduledEmailsForBooking(bookingId: number): Promise<ScheduledEmail[]> {
    return await this.db
      .select()
      .from(scheduledEmails)
      .where(eq(scheduledEmails.bookingId, bookingId))
      .orderBy(scheduledEmails.scheduledFor);
  }

  /**
   * Delete scheduled emails for a booking
   */
  async deleteScheduledEmailsForBooking(bookingId: number): Promise<void> {
    await this.db
      .delete(scheduledEmails)
      .where(eq(scheduledEmails.bookingId, bookingId));
  }

  /**
   * Log email send attempt
   */
  async logEmail(log: {
    scheduledEmailId?: number;
    to: string;
    subject: string;
    emailType: string;
    status: 'sent' | 'failed' | 'bounced';
    provider?: string;
    messageId?: string;
    errorMessage?: string;
  }): Promise<void> {
    await this.db.insert(emailLogs).values(log);
  }

  /**
   * Log email check
   */
  async logEmailCheck(log: {
    emailsFound: number;
    emailsProcessed: number;
    emailsFailed: number;
    status: 'success' | 'failed';
    errorMessage?: string;
    durationMs: number;
  }): Promise<void> {
    await this.db.insert(emailCheckLogs).values(log);
  }

  /**
   * Get recent bookings
   */
  async getRecentBookings(limit: number = 50): Promise<Booking[]> {
    return await this.db
      .select()
      .from(bookings)
      .orderBy(bookings.createdAt)
      .limit(limit);
  }

  /**
   * Get upcoming check-ins (for pre-arrival emails)
   */
  async getUpcomingCheckIns(daysAhead: number = 7): Promise<Booking[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    return await this.db
      .select()
      .from(bookings)
      .where(
        and(
          gte(bookings.checkInDate, today),
          lte(bookings.checkInDate, futureDate)
        )
      );
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: number, reason?: string): Promise<void> {
    await this.db
      .update(bookings)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));
  }

  /**
   * Delete a booking (for modifications - booking will be recreated with updated data)
   */
  async deleteBooking(bookingId: number): Promise<void> {
    await this.db
      .delete(bookings)
      .where(eq(bookings.id, bookingId));
  }

  /**
   * Cancel all pending scheduled emails for a booking
   */
  async cancelScheduledEmailsForBooking(bookingId: number): Promise<void> {
    await this.db
      .update(scheduledEmails)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(scheduledEmails.bookingId, bookingId),
          eq(scheduledEmails.status, 'pending')
        )
      );
  }

  /**
   * Mark transfer notification as sent
   */
  async markTransferNotificationSent(bookingId: number): Promise<void> {
    await this.db
      .update(bookings)
      .set({
        transferNotificationSent: true,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));
  }

  /**
   * Store pending cancellation (for cancellations that arrive before booking)
   */
  async storePendingCancellation(groupRef: string, reason?: string, rawData?: any): Promise<void> {
    await this.db.insert(pendingCancellations).values({
      groupRef,
      cancellationReason: reason,
      rawEmailData: rawData,
    });
  }

  /**
   * Check if there's a pending cancellation for a booking
   */
  async getPendingCancellation(groupRef: string): Promise<any> {
    const [pending] = await this.db
      .select()
      .from(pendingCancellations)
      .where(
        and(
          eq(pendingCancellations.groupRef, groupRef),
          isNull(pendingCancellations.processedAt)
        )
      )
      .limit(1);
    return pending;
  }

  /**
   * Mark pending cancellation as processed
   */
  async markPendingCancellationProcessed(id: number): Promise<void> {
    await this.db
      .update(pendingCancellations)
      .set({
        processedAt: new Date(),
      })
      .where(eq(pendingCancellations.id, id));
  }

  /**
   * Delete pending cancellation for a booking (used when processing modifications)
   */
  async deletePendingCancellation(groupRef: string): Promise<void> {
    await this.db
      .delete(pendingCancellations)
      .where(eq(pendingCancellations.groupRef, groupRef));
  }

  /**
   * Get report statistics for a date range
   */
  async getReportStats(startDate: Date, endDate: Date): Promise<any> {
    const nextDay = new Date(endDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get all bookings in date range
    const allBookings = await this.db
      .select()
      .from(bookings)
      .where(
        and(
          gte(bookings.createdAt, startDate),
          lte(bookings.createdAt, nextDay)
        )
      );

    // Get all emails in date range
    const allEmails = await this.db
      .select()
      .from(emailLogs)
      .where(
        and(
          gte(emailLogs.sentAt, startDate),
          lte(emailLogs.sentAt, nextDay)
        )
      );

    // Get email checks in date range
    const allChecks = await this.db
      .select()
      .from(emailCheckLogs)
      .where(
        and(
          gte(emailCheckLogs.checkTime, startDate),
          lte(emailCheckLogs.checkTime, nextDay)
        )
      );

    // Get pending emails count
    const pendingEmails = await this.db
      .select()
      .from(scheduledEmails)
      .where(eq(scheduledEmails.status, 'pending'));

    // Calculate stats
    const totalBookings = allBookings.length;
    const totalCancellations = allBookings.filter(b => b.status === 'cancelled').length;
    const activeBookings = allBookings.filter(b => b.status === 'active').length;

    const emailsSent = allEmails.filter(e => e.status === 'sent').length;
    const emailsFailed = allEmails.filter(e => e.status === 'failed').length;
    const emailsPending = pendingEmails.length;

    const emailsByType = {
      post_booking: allEmails.filter(e => e.emailType === 'post_booking').length,
      pre_arrival: allEmails.filter(e => e.emailType === 'pre_arrival').length,
      arrival: allEmails.filter(e => e.emailType === 'arrival').length,
      post_departure: allEmails.filter(e => e.emailType === 'post_departure').length,
      cancellation: allEmails.filter(e => e.emailType === 'cancellation').length,
      transfer_notification: allEmails.filter(e => e.emailType === 'transfer_notification').length,
    };

    const transferNotificationsSent = allBookings.filter(b => b.transferNotificationSent).length;

    const emailChecksPerformed = allChecks.length;
    const emailChecksSuccessful = allChecks.filter(c => c.status === 'success').length;
    const emailChecksFailed = allChecks.filter(c => c.status === 'failed').length;

    // Get recent bookings (last 10)
    const recentBookings = allBookings
      .slice(-10)
      .map(b => ({
        groupRef: b.groupRef,
        guestName: b.guestName,
        checkInDate: new Date(b.checkInDate).toLocaleDateString('en-GB'),
        status: b.status,
      }));

    // Get recent errors
    const recentErrors = allEmails
      .filter(e => e.errorMessage)
      .slice(-5)
      .map(e => e.errorMessage || '');

    return {
      totalBookings,
      totalCancellations,
      activeBookings,
      emailsSent,
      emailsFailed,
      emailsPending,
      emailsByType,
      transferNotificationsSent,
      emailChecksPerformed,
      emailChecksSuccessful,
      emailChecksFailed,
      recentBookings,
      recentErrors,
    };
  }
}
