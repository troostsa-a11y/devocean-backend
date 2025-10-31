import type { Booking, InsertScheduledEmail } from '../../shared/schema';
import { DatabaseService } from './database';

/**
 * Email Scheduler Service
 * Calculates when to send automated emails based on booking dates
 */

export class EmailSchedulerService {
  private db: DatabaseService;

  constructor(db: DatabaseService) {
    this.db = db;
  }

  /**
   * Create all scheduled emails for a booking
   * 
   * Schedule:
   * - Post-booking: Within 2 hours after booking created
   * - Pre-arrival: 7 days before check-in (at 09:00)
   * - Arrival: 2 days before check-in (at 09:00)
   * - Post-departure: 1 day after check-out (at 10:00)
   */
  async scheduleEmailsForBooking(booking: Booking): Promise<void> {
    const schedules = this.calculateEmailSchedules(booking);

    for (const schedule of schedules) {
      try {
        await this.db.createScheduledEmail(schedule);
        console.log(`Scheduled ${schedule.emailType} email for booking ${booking.groupRef}`);
      } catch (error) {
        console.error(`Error scheduling ${schedule.emailType} email:`, error);
      }
    }
  }

  /**
   * Calculate when each email should be sent
   * 
   * Conditional scheduling based on days until check-in:
   * 
   * Case 1: >= 7 days until check-in (normal schedule)
   *   - Post-booking: 2 hours after booking
   *   - Pre-arrival: 7 days before check-in at 09:00
   *   - Arrival: 2 days before check-in at 09:00
   * 
   * Case 2: < 7 days but >= 2 days until check-in (adjusted schedule)
   *   - Post-booking: 1 hour after booking
   *   - Pre-arrival: (days_remaining - 2) / 2 days before check-in
   *   - Arrival: 2 days before check-in at 09:00
   * 
   * Case 3: < 2 days until check-in (compressed schedule)
   *   - Post-booking: 1 hour after booking
   *   - Pre-arrival: 3 hours after booking
   *   - Arrival: 6 hours after booking
   */
  private calculateEmailSchedules(booking: Booking): InsertScheduledEmail[] {
    const now = new Date();
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);

    // Calculate days until check-in
    const msUntilCheckIn = checkIn.getTime() - now.getTime();
    const daysUntilCheckIn = msUntilCheckIn / (1000 * 60 * 60 * 24);

    const schedules: InsertScheduledEmail[] = [];

    // Common template data
    const commonTemplateData = {
      guestName: booking.guestName,
      firstName: booking.firstName,
      groupRef: booking.groupRef,
      checkInDate: new Date(booking.checkInDate).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      checkOutDate: new Date(booking.checkOutDate).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      rooms: booking.rooms,
    };

    // Determine scheduling strategy based on days until check-in
    let postBookingHours: number;
    let preArrivalDate: Date | null = null;
    let arrivalDate: Date | null = null;

    if (daysUntilCheckIn >= 7) {
      // Case 1: Normal schedule (>= 7 days)
      console.log(`Booking ${booking.groupRef}: Normal schedule (${daysUntilCheckIn.toFixed(1)} days until check-in)`);
      
      postBookingHours = 2;
      
      preArrivalDate = new Date(checkIn);
      preArrivalDate.setDate(checkIn.getDate() - 7);
      preArrivalDate.setHours(9, 0, 0, 0);
      
      arrivalDate = new Date(checkIn);
      arrivalDate.setDate(checkIn.getDate() - 2);
      arrivalDate.setHours(9, 0, 0, 0);
      
    } else if (daysUntilCheckIn >= 2) {
      // Case 2: Adjusted schedule (< 7 days but >= 2 days)
      console.log(`Booking ${booking.groupRef}: Adjusted schedule (${daysUntilCheckIn.toFixed(1)} days until check-in)`);
      
      postBookingHours = 1;
      
      // Pre-arrival: (days_remaining - 2) / 2 days before check-in
      const preArrivalDaysBeforeCheckIn = (daysUntilCheckIn - 2) / 2;
      preArrivalDate = new Date(checkIn.getTime() - (preArrivalDaysBeforeCheckIn * 24 * 60 * 60 * 1000));
      preArrivalDate.setHours(9, 0, 0, 0);
      
      arrivalDate = new Date(checkIn);
      arrivalDate.setDate(checkIn.getDate() - 2);
      arrivalDate.setHours(9, 0, 0, 0);
      
    } else {
      // Case 3: Compressed schedule (< 2 days)
      console.log(`Booking ${booking.groupRef}: Compressed schedule (${daysUntilCheckIn.toFixed(1)} days until check-in)`);
      
      postBookingHours = 1;
      
      // Pre-arrival: 3 hours after booking
      preArrivalDate = new Date(now.getTime() + 3 * 60 * 60 * 1000);
      
      // Arrival: 6 hours after booking
      arrivalDate = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    }

    // 1. Post-booking email
    const postBookingTime = new Date(now.getTime() + postBookingHours * 60 * 60 * 1000);
    schedules.push({
      bookingId: booking.id,
      emailType: 'post_booking',
      recipientEmail: booking.guestEmail,
      recipientName: booking.guestName,
      language: booking.guestLanguage,
      scheduledFor: postBookingTime,
      status: 'pending',
      templateData: {
        ...commonTemplateData,
        totalPrice: booking.totalPrice,
        currency: booking.currency,
      },
    });
    console.log(`  Post-booking: ${postBookingTime.toISOString()} (${postBookingHours}h from now)`);

    // 2. Pre-arrival email - only if in the future
    if (preArrivalDate && preArrivalDate > now) {
      schedules.push({
        bookingId: booking.id,
        emailType: 'pre_arrival',
        recipientEmail: booking.guestEmail,
        recipientName: booking.guestName,
        language: booking.guestLanguage,
        scheduledFor: preArrivalDate,
        status: 'pending',
        templateData: commonTemplateData,
      });
      console.log(`  Pre-arrival: ${preArrivalDate.toISOString()}`);
    } else {
      console.log(`  Pre-arrival: Skipped (would be in the past)`);
    }

    // 3. Arrival email - only if in the future
    if (arrivalDate && arrivalDate > now) {
      schedules.push({
        bookingId: booking.id,
        emailType: 'arrival',
        recipientEmail: booking.guestEmail,
        recipientName: booking.guestName,
        language: booking.guestLanguage,
        scheduledFor: arrivalDate,
        status: 'pending',
        templateData: commonTemplateData,
      });
      console.log(`  Arrival: ${arrivalDate.toISOString()}`);
    } else {
      console.log(`  Arrival: Skipped (would be in the past)`);
    }

    // 4. Post-departure email - always schedule (1 day after check-out at 10:00)
    const postDepartureDate = new Date(checkOut);
    postDepartureDate.setDate(checkOut.getDate() + 1);
    postDepartureDate.setHours(10, 0, 0, 0);

    schedules.push({
      bookingId: booking.id,
      emailType: 'post_departure',
      recipientEmail: booking.guestEmail,
      recipientName: booking.guestName,
      language: booking.guestLanguage,
      scheduledFor: postDepartureDate,
      status: 'pending',
      templateData: commonTemplateData,
    });
    console.log(`  Post-departure: ${postDepartureDate.toISOString()}`);

    return schedules;
  }

  /**
   * Process pending scheduled emails
   * Called by cron job to send emails that are due
   */
  async processPendingEmails(): Promise<number> {
    const pendingEmails = await this.db.getPendingScheduledEmails();
    console.log(`Found ${pendingEmails.length} pending emails to process`);

    let sentCount = 0;

    for (const email of pendingEmails) {
      try {
        // The actual email sending will be handled by EmailSenderService
        // This is just marking them as ready for processing
        console.log(`Email ${email.id} ready to send: ${email.emailType} to ${email.recipientEmail}`);
        sentCount++;
      } catch (error) {
        console.error(`Error processing email ${email.id}:`, error);
      }
    }

    return sentCount;
  }
}
