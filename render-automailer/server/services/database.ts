import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { bookings, scheduledEmails, emailLogs, emailCheckLogs, pendingCancellations, guests } from '../../shared/schema';
import type { InsertBooking, InsertScheduledEmail, Booking, ScheduledEmail, Guest, InsertGuest } from '../../shared/schema';
import { eq, and, lte, gte, isNull, sql, or, ilike, count, desc } from 'drizzle-orm';

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
   * Mark scheduled email as permanently failed (no more retries)
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
   * Schedule email for retry (temporary failure)
   * Keeps status as 'pending' but updates scheduledFor to future time
   */
  async scheduleEmailRetry(emailId: number, retryAt: Date, errorMessage: string): Promise<void> {
    // First get current retry count
    const [email] = await this.db
      .select({ retryCount: scheduledEmails.retryCount })
      .from(scheduledEmails)
      .where(eq(scheduledEmails.id, emailId))
      .limit(1);

    await this.db
      .update(scheduledEmails)
      .set({
        status: 'pending',
        scheduledFor: retryAt,
        errorMessage: `[Retry scheduled] ${errorMessage}`,
        retryCount: (email?.retryCount || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(scheduledEmails.id, emailId));
  }

  /**
   * Get current retry count for an email
   */
  async getEmailRetryCount(emailId: number): Promise<number> {
    const [email] = await this.db
      .select({ retryCount: scheduledEmails.retryCount })
      .from(scheduledEmails)
      .where(eq(scheduledEmails.id, emailId))
      .limit(1);
    return email?.retryCount || 0;
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
   * Update booking dates (for admin date modifications)
   * Also resets postBookingEmailSent so the confirmation is resent with new dates
   */
  async updateBookingDates(bookingId: number, checkInDate: Date, checkOutDate: Date): Promise<void> {
    await this.db
      .update(bookings)
      .set({
        checkInDate,
        checkOutDate,
        postBookingEmailSent: false,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));
  }

  async updateGuestEmail(bookingId: number, newEmail: string): Promise<void> {
    await this.db
      .update(bookings)
      .set({
        guestEmail: newEmail,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    await this.db
      .update(scheduledEmails)
      .set({
        recipientEmail: newEmail,
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
    };

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
      emailChecksPerformed,
      emailChecksSuccessful,
      emailChecksFailed,
      recentBookings,
      recentErrors,
    };
  }

  // ─── Guest (marketing contact) methods ─────────────────────────────────────

  /**
   * Create guests table if it doesn't exist (idempotent, called on startup)
   */
  async initGuestsTable(): Promise<void> {
    await this.client`
      CREATE TABLE IF NOT EXISTS guests (
        id          SERIAL PRIMARY KEY,
        email       TEXT NOT NULL UNIQUE,
        first_name  TEXT,
        last_name   TEXT,
        phone       TEXT,
        country_code TEXT,
        subscribed  BOOLEAN NOT NULL DEFAULT TRUE,
        unsubscribed_at TIMESTAMP,
        source      TEXT NOT NULL DEFAULT 'import',
        total_spent DECIMAL(10,2),
        last_checkin TIMESTAMP,
        tags        TEXT[],
        unsubscribe_token TEXT UNIQUE,
        notes       TEXT,
        created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
  }

  /**
   * Upsert a batch of guests (insert or update on email conflict).
   * Preserves subscribed=false if already unsubscribed.
   * Enriches phone/country only if currently missing.
   */
  async upsertGuests(records: InsertGuest[]): Promise<{ imported: number; updated: number }> {
    if (!records.length) return { imported: 0, updated: 0 };

    let imported = 0;
    let updated = 0;

    // Process in chunks of 100 to avoid oversized queries
    const chunkSize = 100;
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      const results = await this.db
        .insert(guests)
        .values(chunk as any)
        .onConflictDoUpdate({
          target: guests.email,
          set: {
            firstName: sql`CASE WHEN EXCLUDED.first_name IS NOT NULL AND EXCLUDED.first_name != '' THEN EXCLUDED.first_name ELSE guests.first_name END`,
            lastName: sql`CASE WHEN EXCLUDED.last_name IS NOT NULL AND EXCLUDED.last_name != '' THEN EXCLUDED.last_name ELSE guests.last_name END`,
            phone: sql`CASE WHEN (guests.phone IS NULL OR guests.phone = '') AND EXCLUDED.phone IS NOT NULL AND EXCLUDED.phone != '' THEN EXCLUDED.phone ELSE guests.phone END`,
            countryCode: sql`CASE WHEN guests.country_code IS NULL AND EXCLUDED.country_code IS NOT NULL THEN EXCLUDED.country_code ELSE guests.country_code END`,
            totalSpent: sql`CASE WHEN EXCLUDED.total_spent IS NOT NULL AND (guests.total_spent IS NULL OR EXCLUDED.total_spent > guests.total_spent) THEN EXCLUDED.total_spent ELSE guests.total_spent END`,
            lastCheckin: sql`CASE WHEN EXCLUDED.last_checkin IS NOT NULL AND (guests.last_checkin IS NULL OR EXCLUDED.last_checkin > guests.last_checkin) THEN EXCLUDED.last_checkin ELSE guests.last_checkin END`,
            tags: sql`CASE WHEN EXCLUDED.tags IS NOT NULL THEN EXCLUDED.tags ELSE guests.tags END`,
            unsubscribeToken: sql`CASE WHEN guests.unsubscribe_token IS NULL THEN EXCLUDED.unsubscribe_token ELSE guests.unsubscribe_token END`,
            updatedAt: sql`NOW()`,
          },
        })
        .returning({ id: guests.id, createdAt: guests.createdAt });

      for (const r of results) {
        const ageMs = Date.now() - new Date(r.createdAt).getTime();
        if (ageMs < 5000) imported++;
        else updated++;
      }
    }

    return { imported, updated };
  }

  /**
   * Get paginated guest list with optional filters
   */
  async getGuests(opts: {
    page?: number;
    limit?: number;
    subscribed?: boolean;
    source?: string;
    search?: string;
  }): Promise<{ rows: Guest[]; total: number }> {
    const page = opts.page ?? 1;
    const limit = Math.min(opts.limit ?? 50, 200);
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (opts.subscribed !== undefined) conditions.push(eq(guests.subscribed, opts.subscribed));
    if (opts.source) conditions.push(eq(guests.source, opts.source));
    if (opts.search) {
      const q = `%${opts.search}%`;
      conditions.push(or(ilike(guests.email, q), ilike(guests.firstName, q), ilike(guests.lastName, q)));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, [{ value: total }]] = await Promise.all([
      this.db.select().from(guests).where(where).orderBy(desc(guests.createdAt)).limit(limit).offset(offset),
      this.db.select({ value: count() }).from(guests).where(where),
    ]);

    return { rows, total: Number(total) };
  }

  /**
   * Get total subscriber stats
   */
  async getGuestStats(): Promise<{ total: number; subscribed: number; sources: Record<string, number> }> {
    const [totalRes, subscribedRes, sourceRes] = await Promise.all([
      this.db.select({ value: count() }).from(guests),
      this.db.select({ value: count() }).from(guests).where(eq(guests.subscribed, true)),
      this.db.select({ source: guests.source, value: count() }).from(guests).groupBy(guests.source),
    ]);
    const sources: Record<string, number> = {};
    for (const r of sourceRes) sources[r.source ?? 'unknown'] = Number(r.value);
    return { total: Number(totalRes[0].value), subscribed: Number(subscribedRes[0].value), sources };
  }

  /**
   * Get all subscribed guests (for broadcast)
   */
  async getSubscribedGuests(): Promise<Pick<Guest, 'email' | 'firstName' | 'lastName' | 'unsubscribeToken'>[]> {
    return this.db
      .select({ email: guests.email, firstName: guests.firstName, lastName: guests.lastName, unsubscribeToken: guests.unsubscribeToken })
      .from(guests)
      .where(eq(guests.subscribed, true));
  }

  /**
   * Find guest by unsubscribe token
   */
  async getGuestByUnsubscribeToken(token: string): Promise<Guest | undefined> {
    const [guest] = await this.db.select().from(guests).where(eq(guests.unsubscribeToken, token)).limit(1);
    return guest;
  }

  /**
   * Mark a guest as unsubscribed
   */
  async unsubscribeGuest(token: string): Promise<boolean> {
    const result = await this.db
      .update(guests)
      .set({ subscribed: false, unsubscribedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(guests.unsubscribeToken, token), eq(guests.subscribed, true)))
      .returning({ id: guests.id });
    return result.length > 0;
  }
}
