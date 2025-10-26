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
   */
  private calculateEmailSchedules(booking: Booking): InsertScheduledEmail[] {
    const now = new Date();
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);

    const schedules: InsertScheduledEmail[] = [];

    // 1. Post-booking email - send within 2 hours
    const postBookingTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    schedules.push({
      bookingId: booking.id,
      emailType: 'post_booking',
      recipientEmail: booking.guestEmail,
      recipientName: booking.guestName,
      language: booking.guestLanguage,
      scheduledFor: postBookingTime,
      status: 'pending',
      templateData: {
        guestName: booking.guestName,
        groupRef: booking.groupRef,
        checkInDate: new Date(booking.checkInDate).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        checkOutDate: new Date(booking.checkOutDate).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        rooms: booking.rooms,
        totalPrice: booking.totalPrice,
        currency: booking.currency,
      },
    });

    // 2. Pre-arrival email - 7 days before check-in at 09:00
    const preArrivalDate = new Date(checkIn);
    preArrivalDate.setDate(checkIn.getDate() - 7);
    preArrivalDate.setHours(9, 0, 0, 0);

    // Only schedule if it's in the future
    if (preArrivalDate > now) {
      schedules.push({
        bookingId: booking.id,
        emailType: 'pre_arrival',
        recipientEmail: booking.guestEmail,
        recipientName: booking.guestName,
        language: booking.guestLanguage,
        scheduledFor: preArrivalDate,
        status: 'pending',
        templateData: {
          guestName: booking.guestName,
          groupRef: booking.groupRef,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          rooms: booking.rooms,
        },
      });
    }

    // 3. Arrival email - 2 days before check-in at 09:00
    const arrivalDate = new Date(checkIn);
    arrivalDate.setDate(checkIn.getDate() - 2);
    arrivalDate.setHours(9, 0, 0, 0);

    // Only schedule if it's in the future
    if (arrivalDate > now) {
      schedules.push({
        bookingId: booking.id,
        emailType: 'arrival',
        recipientEmail: booking.guestEmail,
        recipientName: booking.guestName,
        language: booking.guestLanguage,
        scheduledFor: arrivalDate,
        status: 'pending',
        templateData: {
          guestName: booking.guestName,
          groupRef: booking.groupRef,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          rooms: booking.rooms,
        },
      });
    }

    // 4. Post-departure email - 1 day after check-out at 10:00
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
      templateData: {
        guestName: booking.guestName,
        groupRef: booking.groupRef,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
      },
    });

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
