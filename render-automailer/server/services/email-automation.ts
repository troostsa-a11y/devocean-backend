import * as cron from 'node-cron';
import { DatabaseService } from './database';
import { EmailParser } from './email-parser';
import { EmailSchedulerService } from './email-scheduler';
import { EmailSenderService } from './email-sender';
import { CancellationHandler } from './cancellation-handler';
import { ModificationHandler } from './modification-handler';
import { AdminReportingService } from './admin-reporting';
import { insertBookingSchema } from '../../shared/schema';
import { ZodError } from 'zod';

/**
 * Email Automation Service
 * Orchestrates the entire email automation workflow:
 * 1. Check IMAP inbox for new Beds24 booking notifications
 * 2. Parse and store booking data
 * 3. Schedule automated emails
 * 4. Send scheduled emails
 */

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  tls: boolean;
}

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface TaxiCompanyConfig {
  email: string;
  whatsapp?: string;
  name: string;
}

export class EmailAutomationService {
  private db: DatabaseService;
  private emailScheduler: EmailSchedulerService;
  private emailSender: EmailSenderService;
  private cancellationHandler: CancellationHandler;
  private modificationHandler: ModificationHandler;
  private adminReporting?: AdminReportingService;
  private imapConfig: EmailConfig;
  private cronJob?: cron.ScheduledTask;
  private emailSenderJob?: cron.ScheduledTask;
  private dailyReportJob?: cron.ScheduledTask;
  private weeklyReportJob?: cron.ScheduledTask;

  constructor(
    databaseUrl: string,
    smtpConfig: SMTPConfig,
    imapConfig: EmailConfig,
    taxiConfig?: TaxiCompanyConfig,
    adminEmail?: string,
    fromEmail?: string,
    fromName?: string,
    bccEmail?: string
  ) {
    this.db = new DatabaseService(databaseUrl);
    this.emailScheduler = new EmailSchedulerService(this.db);
    this.emailSender = new EmailSenderService(smtpConfig, this.db, fromEmail, fromName, bccEmail);
    this.cancellationHandler = new CancellationHandler(this.db, smtpConfig, fromEmail, fromName, bccEmail);
    this.modificationHandler = new ModificationHandler(this.db);
    
    // Initialize admin reporting service
    if (adminEmail) {
      this.adminReporting = new AdminReportingService(
        smtpConfig,
        this.db,
        adminEmail,
        fromEmail,
        fromName
      );
    }
    
    this.imapConfig = imapConfig;
  }

  /**
   * Start the cron job scheduler
   * Checks emails every 30 minutes for new bookings, modifications, and cancellations at :00 and :30
   * Sends scheduled emails every 30 minutes at :15 and :45 (15 minutes after email check)
   * Sends daily report at 14:00 CAT (2 PM)
   * Sends weekly report at 08:00 CAT on Mondays
   */
  start(): void {
    console.log('Starting email automation service...');

    // Schedule 1: Incoming email check every 30 minutes at :00 and :30
    // Cron format: */30 * * * * (runs at :00 and :30 of every hour)
    const emailCheckSchedule = '*/30 * * * *';

    this.cronJob = cron.schedule(emailCheckSchedule, async () => {
      console.log(`[${new Date().toISOString()}] Running scheduled email check...`);
      await this.runEmailCheck();
    });

    console.log(`Email automation scheduled to check every 30 minutes for new bookings, modifications, and cancellations`);

    // Schedule 2: Send scheduled emails every 30 minutes at :15 and :45 (15 minutes after email check)
    // Cron format: 15,45 * * * * (runs at :15 and :45 of every hour)
    const emailSenderSchedule = '15,45 * * * *';

    this.emailSenderJob = cron.schedule(emailSenderSchedule, async () => {
      console.log(`[${new Date().toISOString()}] Sending scheduled emails...`);
      await this.sendScheduledEmails();
    });

    console.log(`Scheduled email sending runs every 30 minutes at :15 and :45 (15 minutes after email check)`);

    // Schedule daily report at 14:00 CAT (12:00 UTC)
    if (this.adminReporting) {
      this.dailyReportJob = cron.schedule('0 12 * * *', async () => {
        console.log(`[${new Date().toISOString()}] Sending daily report...`);
        await this.adminReporting!.sendDailyReport();
      });
      console.log(`Daily reports scheduled for 14:00 CAT (12:00 UTC)`);

      // Schedule weekly report at 08:00 CAT on Mondays (06:00 UTC, day 1)
      this.weeklyReportJob = cron.schedule('0 6 * * 1', async () => {
        console.log(`[${new Date().toISOString()}] Sending weekly report...`);
        await this.adminReporting!.sendWeeklyReport();
      });
      console.log(`Weekly reports scheduled for 08:00 CAT on Mondays (06:00 UTC)`);
    }

    // Run immediate check on startup to process any backlog
    // This ensures pending emails are sent even after server restarts
    console.log('Running startup email check to process any pending emails...');
    this.runEmailCheck().catch(error => {
      console.error('Error during startup email check:', error);
    });
    
    // Also send any pending scheduled emails on startup
    console.log('Sending any pending scheduled emails from backlog...');
    this.sendScheduledEmails().catch(error => {
      console.error('Error during startup scheduled email send:', error);
    });
  }

  /**
   * Stop the cron jobs
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('Email automation service stopped');
    }
    if (this.emailSenderJob) {
      this.emailSenderJob.stop();
      console.log('Scheduled email sender stopped');
    }
    if (this.dailyReportJob) {
      this.dailyReportJob.stop();
      console.log('Daily reporting stopped');
    }
    if (this.weeklyReportJob) {
      this.weeklyReportJob.stop();
      console.log('Weekly reporting stopped');
    }
  }

  /**
   * Run a manual email check (for testing)
   */
  async runManualCheck(): Promise<void> {
    console.log('Running manual email check...');
    await this.runEmailCheck();
  }

  /**
   * Main email check workflow
   */
  private async runEmailCheck(): Promise<void> {
    const startTime = Date.now();
    let emailsFound = 0;
    let emailsProcessed = 0;
    let emailsFailed = 0;

    try {
      // Step 1: Check for new booking emails
      console.log('Checking for new booking emails...');
      const messages = await EmailParser.fetchUnreadEmails(this.imapConfig);
      emailsFound = messages.length;
      console.log(`Found ${emailsFound} unread emails`);

      // Step 2: Process each email
      for (const message of messages) {
        try {
          const parts = message.parts;
          let emailContent = '';

          // Combine all parts to get full email content
          for (const part of parts) {
            if (part.which === '') {
              emailContent += part.body;
            }
          }

          // Check if this is a cancellation email first
          const rawData = {
            subject: 'Cancellation notification',
            from: 'beds24',
            date: new Date(),
          };
          const isCancellation = await this.cancellationHandler.processCancellationEmail(emailContent, rawData);

          if (isCancellation) {
            console.log('Processed cancellation email');
            emailsProcessed++;
            await EmailParser.markEmailAsRead(this.imapConfig, message.attributes.uid);
            continue;
          }

          // Check if this is a modification email (deletes old booking to process as new)
          const isModification = await this.modificationHandler.processModificationEmail(emailContent);
          
          if (isModification) {
            console.log('Detected modification email - old booking deleted, processing as new');
          }

          // Parse the email as a booking notification (works for both new and modified bookings)
          const parsedBooking = await EmailParser.parseBookingEmail(emailContent);

          if (parsedBooking) {
            // Check if booking already exists
            const existingBooking = await this.db.getBookingByGroupRef(parsedBooking.groupRef);

            if (existingBooking) {
              console.log(`Booking ${parsedBooking.groupRef} already exists, skipping`);
            } else {
              // Validate booking data
              const validatedBooking = insertBookingSchema.parse(parsedBooking);

              // Create booking in database
              const booking = await this.db.createBooking(validatedBooking);
              console.log(`Created booking ${booking.groupRef} (ID: ${booking.id})`);

              // Check if there's a pending cancellation for this booking
              const pendingCancellation = await this.db.getPendingCancellation(booking.groupRef);
              
              if (pendingCancellation) {
                // Cancellation arrived before booking - cancel immediately
                console.log(`⚠️ Pending cancellation found for booking ${booking.groupRef}`);
                await this.cancellationHandler.cancelBooking(
                  booking.groupRef,
                  pendingCancellation.cancellationReason
                );
                await this.db.markPendingCancellationProcessed(pendingCancellation.id);
                console.log(`✅ Applied pending cancellation to booking ${booking.groupRef}`);
                // Don't schedule emails for cancelled bookings
              } else {
                // Schedule automated emails normally
                await this.emailScheduler.scheduleEmailsForBooking(booking);
                console.log(`Scheduled emails for booking ${booking.groupRef}`);
              }

              
              emailsProcessed++;
            }

            // Mark email as read
            await EmailParser.markEmailAsRead(this.imapConfig, message.attributes.uid);
          } else {
            console.log('Email is not a Beds24 booking notification');
          }
        } catch (error) {
          console.error('Error processing email:', error);
          emailsFailed++;
        }
      }

      // Step 3: Log the check
      const durationMs = Date.now() - startTime;
      await this.db.logEmailCheck({
        emailsFound,
        emailsProcessed,
        emailsFailed,
        status: 'success',
        durationMs,
      });

      console.log(`Email check completed in ${durationMs}ms`);
    } catch (error) {
      console.error('Error during email check:', error);

      // Log the failure
      const durationMs = Date.now() - startTime;
      await this.db.logEmailCheck({
        emailsFound,
        emailsProcessed,
        emailsFailed,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        durationMs,
      });
    }
  }

  /**
   * Send scheduled emails workflow
   * Runs every 30 minutes at :15 and :45 (15 minutes after email check)
   */
  private async sendScheduledEmails(): Promise<void> {
    try {
      console.log('Processing pending scheduled emails...');
      const result = await this.emailSender.processPendingEmails();
      console.log(`Sent ${result.sent} emails, ${result.failed} failed`);
    } catch (error) {
      console.error('Error sending scheduled emails:', error);
    }
  }

  /**
   * Create a manual booking and schedule all emails
   * Used for directly entered Beds24 reservations that don't trigger email notifications
   */
  async createManualBooking(bookingData: {
    groupRef: string;
    bookingRefs?: string[];
    guestName: string;
    firstName: string;
    guestGender?: 'male' | 'female' | null;
    guestEmail: string;
    guestLanguage: string;
    guestCountry?: string;
    checkInDate: string;
    checkOutDate: string;
  }): Promise<{ booking: any; scheduledEmails: any[] }> {
    const existing = await this.db.getBookingByGroupRef(bookingData.groupRef);
    if (existing) {
      throw new Error(`Booking with group ref ${bookingData.groupRef} already exists`);
    }

    const validated = insertBookingSchema.parse({
      groupRef: bookingData.groupRef,
      bookingRefs: bookingData.bookingRefs || [bookingData.groupRef],
      guestName: bookingData.guestName,
      firstName: bookingData.firstName,
      guestGender: bookingData.guestGender || null,
      guestEmail: bookingData.guestEmail,
      guestLanguage: bookingData.guestLanguage || 'EN',
      guestCountry: bookingData.guestCountry,
      checkInDate: new Date(bookingData.checkInDate),
      checkOutDate: new Date(bookingData.checkOutDate),
      status: 'active',
    });

    const booking = await this.db.createBooking(validated);
    console.log(`[ADMIN] Manual booking created: ${booking.groupRef} for ${booking.guestName}`);

    await this.emailScheduler.scheduleEmailsForBooking(booking);

    const scheduled = await this.db.getScheduledEmailsForBooking(booking.id);
    console.log(`[ADMIN] ${scheduled.length} emails scheduled for booking ${booking.groupRef}`);

    return { booking, scheduledEmails: scheduled };
  }

  /**
   * Cancel a booking manually by group reference
   * Cancels all pending emails and schedules a cancellation goodbye email
   */
  async cancelManualBooking(groupRef: string, reason?: string): Promise<{ booking: any; cancelledEmails: number }> {
    const booking = await this.db.getBookingByGroupRef(groupRef);
    if (!booking) {
      throw new Error(`Booking with group ref ${groupRef} not found`);
    }

    if (booking.status === 'cancelled') {
      throw new Error(`Booking ${groupRef} is already cancelled`);
    }

    const pendingBefore = await this.db.getScheduledEmailsForBooking(booking.id);
    const pendingCount = pendingBefore.filter(e => e.status === 'pending').length;

    await this.cancellationHandler.cancelBooking(groupRef, reason || 'Manual cancellation via admin API');

    const updatedBooking = await this.db.getBookingByGroupRef(groupRef);

    console.log(`[ADMIN] Booking ${groupRef} cancelled. ${pendingCount} pending emails stopped. Cancellation email scheduled.`);

    return { booking: updatedBooking || booking, cancelledEmails: pendingCount };
  }

  /**
   * Modify booking dates, cancel pending emails, reschedule all emails,
   * and resend the post-booking confirmation with the updated dates.
   */
  async modifyBookingDates(groupRef: string, checkInDate: string, checkOutDate: string): Promise<{
    booking: any;
    cancelledEmails: number;
    scheduledEmails: any[];
  }> {
    const booking = await this.db.getBookingByGroupRef(groupRef);
    if (!booking) {
      throw new Error(`Booking with group ref ${groupRef} not found`);
    }
    if (booking.status === 'cancelled') {
      throw new Error(`Booking ${groupRef} is cancelled and cannot be modified`);
    }

    const newCheckIn = new Date(checkInDate);
    const newCheckOut = new Date(checkOutDate);

    if (isNaN(newCheckIn.getTime()) || isNaN(newCheckOut.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD.');
    }
    if (newCheckOut <= newCheckIn) {
      throw new Error('Check-out date must be after check-in date');
    }

    // Cancel all pending scheduled emails
    const allScheduled = await this.db.getScheduledEmailsForBooking(booking.id);
    const pendingCount = allScheduled.filter(e => e.status === 'pending').length;
    await this.db.cancelScheduledEmailsForBooking(booking.id);

    // Update dates in the database (also resets postBookingEmailSent flag)
    await this.db.updateBookingDates(booking.id, newCheckIn, newCheckOut);

    // Fetch updated booking record
    const updatedBooking = await this.db.getBookingByGroupRef(groupRef);

    // Reschedule all emails based on the new dates
    await this.emailScheduler.scheduleEmailsForBooking(updatedBooking!);

    const newScheduled = await this.db.getScheduledEmailsForBooking(updatedBooking!.id);
    const newPending = newScheduled.filter(e => e.status === 'pending');

    console.log(`[ADMIN] Booking ${groupRef} dates modified: check-in ${checkInDate}, check-out ${checkOutDate}. ${pendingCount} old emails cancelled, ${newPending.length} new emails scheduled.`);

    return { booking: updatedBooking, cancelledEmails: pendingCount, scheduledEmails: newPending };
  }

  async updateGuestEmail(groupRef: string, newEmail: string): Promise<{ booking: any; oldEmail: string; pendingEmailsUpdated: number }> {
    const booking = await this.db.getBookingByGroupRef(groupRef);
    if (!booking) {
      throw new Error(`Booking with group ref ${groupRef} not found`);
    }

    const oldEmail = booking.guestEmail;

    const pendingEmails = await this.db.getScheduledEmailsForBooking(booking.id);
    const pendingCount = pendingEmails.filter(e => e.status === 'pending').length;

    await this.db.updateGuestEmail(booking.id, newEmail);

    const updatedBooking = await this.db.getBookingByGroupRef(groupRef);

    console.log(`[ADMIN] Email updated for booking ${groupRef}: ${oldEmail} → ${newEmail}. ${pendingCount} pending emails redirected.`);

    return { booking: updatedBooking || { ...booking, guestEmail: newEmail }, oldEmail, pendingEmailsUpdated: pendingCount };
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.db.close();
  }
}
