import type { Booking, InsertScheduledEmail } from '../../shared/schema';
import { DatabaseService } from './database';
import { DateTime } from 'luxon';
import { getCATNow, toCATDateTime, setTimeInCAT, addHoursInCAT, addDaysInCAT, toUTCDate, formatForLog } from '../utils/timezone';

/**
 * Email Scheduler Service
 * Calculates when to send automated emails based on booking dates
 * 
 * ALL SCHEDULING OPERATES IN CENTRAL AFRICAN TIME (CAT = UTC+2)
 * Times are calculated in CAT then converted to UTC for database storage
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
   * - Post-booking: 1 hour after processing
   * - Pre-arrival: 7 days before check-in (at 09:00 CAT)
   * - Arrival: 2 days before check-in (at 09:00 CAT)
   * - Post-departure: 1 day after check-out (at 10:00 CAT)
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
   * Calculate when each email should be sent (ALL TIMES IN CAT)
   * 
   * Conditional scheduling based on days until check-in:
   * 
   * Case 1: >= 7 days until check-in (normal schedule)
   *   - Post-booking: 1 hour after processing (CAT)
   *   - Pre-arrival: 7 days before check-in at 09:00 CAT
   *   - Arrival: 2 days before check-in at 09:00 CAT
   * 
   * Case 2: < 7 days but >= 2 days until check-in (adjusted schedule)
   *   - Post-booking: 1 hour after processing (CAT)
   *   - Pre-arrival: (days_remaining - 2) / 2 days before check-in at 09:00 CAT
   *   - Arrival: 2 days before check-in at 09:00 CAT
   * 
   * Case 3: < 2 days until check-in (compressed schedule)
   *   - Post-booking: 1 hour after processing (CAT)
   *   - Pre-arrival: 3 hours after booking (CAT)
   *   - Arrival: 6 hours after booking (CAT)
   */
  private calculateEmailSchedules(booking: Booking): InsertScheduledEmail[] {
    // Get current time in CAT
    const nowCAT = getCATNow();
    const checkInCAT = toCATDateTime(booking.checkInDate);
    const checkOutCAT = toCATDateTime(booking.checkOutDate);

    // Calculate days until check-in
    const daysUntilCheckIn = checkInCAT.diff(nowCAT, 'days').days;

    const schedules: InsertScheduledEmail[] = [];

    // Common template data
    const commonTemplateData = {
      guestName: booking.guestName,
      firstName: booking.firstName,
      gender: booking.guestGender,
      groupRef: booking.groupRef,
      checkInDate: checkInCAT.toLocaleString({ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      checkOutDate: checkOutCAT.toLocaleString({ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      rooms: booking.rooms,
    };

    // Determine scheduling strategy based on days until check-in
    let preArrivalDateCAT: DateTime | null = null;
    let arrivalDateCAT: DateTime | null = null;

    if (daysUntilCheckIn >= 7) {
      // Case 1: Normal schedule (>= 7 days)
      console.log(`Booking ${booking.groupRef}: Normal schedule (${daysUntilCheckIn.toFixed(1)} days until check-in)`);
      
      // Pre-arrival: 7 days before check-in at 09:00 CAT
      preArrivalDateCAT = setTimeInCAT(addDaysInCAT(checkInCAT, -7), 9, 0);
      
      // Arrival: 2 days before check-in at 09:00 CAT
      arrivalDateCAT = setTimeInCAT(addDaysInCAT(checkInCAT, -2), 9, 0);
      
    } else if (daysUntilCheckIn >= 2) {
      // Case 2: Adjusted schedule (< 7 days but >= 2 days)
      console.log(`Booking ${booking.groupRef}: Adjusted schedule (${daysUntilCheckIn.toFixed(1)} days until check-in)`);
      
      // Pre-arrival: (days_remaining - 2) / 2 days before check-in at 09:00 CAT
      const preArrivalDaysBeforeCheckIn = (daysUntilCheckIn - 2) / 2;
      preArrivalDateCAT = setTimeInCAT(addDaysInCAT(checkInCAT, -preArrivalDaysBeforeCheckIn), 9, 0);
      
      // Arrival: 2 days before check-in at 09:00 CAT
      arrivalDateCAT = setTimeInCAT(addDaysInCAT(checkInCAT, -2), 9, 0);
      
    } else {
      // Case 3: Compressed schedule (< 2 days)
      console.log(`Booking ${booking.groupRef}: Compressed schedule (${daysUntilCheckIn.toFixed(1)} days until check-in)`);
      
      // Pre-arrival: 3 hours after booking (CAT)
      preArrivalDateCAT = addHoursInCAT(nowCAT, 3);
      
      // Arrival: 6 hours after booking (CAT)
      arrivalDateCAT = addHoursInCAT(nowCAT, 6);
    }

    // 1. Post-booking email - ALWAYS 1 hour after processing (CAT)
    const postBookingTimeCAT = addHoursInCAT(nowCAT, 1);
    const postBookingTimeUTC = toUTCDate(postBookingTimeCAT);
    schedules.push({
      bookingId: booking.id,
      emailType: 'post_booking',
      recipientEmail: booking.guestEmail,
      recipientName: booking.guestName,
      language: booking.guestLanguage,
      scheduledFor: postBookingTimeUTC,
      status: 'pending',
      templateData: {
        ...commonTemplateData,
        totalPrice: booking.totalPrice,
        currency: booking.currency,
      },
    });
    console.log(`  Post-booking: ${formatForLog(postBookingTimeCAT)} (1h from now)`);

    // 2. Pre-arrival email - only if in the future
    if (preArrivalDateCAT && preArrivalDateCAT > nowCAT) {
      const preArrivalDateUTC = toUTCDate(preArrivalDateCAT);
      schedules.push({
        bookingId: booking.id,
        emailType: 'pre_arrival',
        recipientEmail: booking.guestEmail,
        recipientName: booking.guestName,
        language: booking.guestLanguage,
        scheduledFor: preArrivalDateUTC,
        status: 'pending',
        templateData: commonTemplateData,
      });
      console.log(`  Pre-arrival: ${formatForLog(preArrivalDateCAT)}`);
    } else {
      console.log(`  Pre-arrival: Skipped (would be in the past)`);
    }

    // 3. Arrival email - only if in the future
    if (arrivalDateCAT && arrivalDateCAT > nowCAT) {
      const arrivalDateUTC = toUTCDate(arrivalDateCAT);
      schedules.push({
        bookingId: booking.id,
        emailType: 'arrival',
        recipientEmail: booking.guestEmail,
        recipientName: booking.guestName,
        language: booking.guestLanguage,
        scheduledFor: arrivalDateUTC,
        status: 'pending',
        templateData: commonTemplateData,
      });
      console.log(`  Arrival: ${formatForLog(arrivalDateCAT)}`);
    } else {
      console.log(`  Arrival: Skipped (would be in the past)`);
    }

    // 4. Post-departure email - always schedule (1 day after check-out at 10:00 CAT)
    const postDepartureDateCAT = setTimeInCAT(addDaysInCAT(checkOutCAT, 1), 10, 0);
    const postDepartureDateUTC = toUTCDate(postDepartureDateCAT);

    schedules.push({
      bookingId: booking.id,
      emailType: 'post_departure',
      recipientEmail: booking.guestEmail,
      recipientName: booking.guestName,
      language: booking.guestLanguage,
      scheduledFor: postDepartureDateUTC,
      status: 'pending',
      templateData: commonTemplateData,
    });
    console.log(`  Post-departure: ${formatForLog(postDepartureDateCAT)}`);

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
