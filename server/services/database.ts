import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { bookings, scheduledEmails, emailLogs, emailCheckLogs } from '../../shared/schema';
import type { InsertBooking, InsertScheduledEmail, Booking, ScheduledEmail } from '../../shared/schema';
import { eq, and, lte, gte } from 'drizzle-orm';

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
      .values(booking)
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
}
