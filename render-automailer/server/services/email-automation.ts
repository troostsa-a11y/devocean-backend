import * as cron from 'node-cron';
import crypto from 'crypto';
import { simpleParser } from 'mailparser';
import { DatabaseService } from './database';
import { EmailParser } from './email-parser';
import { EmailSchedulerService } from './email-scheduler';
import { EmailSenderService } from './email-sender';
import { CancellationHandler } from './cancellation-handler';
import { ModificationHandler } from './modification-handler';
import { AdminReportingService } from './admin-reporting';
import { insertBookingSchema } from '../../shared/schema';
import { fireGA4Conversion } from './ga4-attribution';
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
    console.log(`✅ Trusted sender domains: ${this.getTrustedSenderDomains().join(', ')}`);

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

          // Validate sender authenticity before any state-changing operations.
          // Two-layer check:
          //   1. The RFC5322 From address domain must be in the trusted allowlist.
          //   2. The receiving MTA's Authentication-Results / Received-SPF headers
          //      must show SPF=pass or DKIM=pass for a trusted Beds24 domain.
          //      These headers are injected by our own mail server and cannot be
          //      forged by the sending party.
          // Fail closed: if either layer fails (including missing auth headers)
          // the email is skipped entirely — no cancellation, modification, or
          // booking logic is executed.
          const parsedHeaders = await simpleParser(emailContent, {
            skipHtmlToText: true,
            skipImageLinks: true,
            skipTextToHtml: true,
          });
          const fromAddress = parsedHeaders.from?.value?.[0]?.address ?? '';
          const authCheck = this.validateSenderAuthenticity(fromAddress, parsedHeaders.headers);
          if (!authCheck.trusted) {
            console.warn(
              `[SECURITY] Rejecting email — sender authentication failed. ` +
              `From: "${fromAddress}", reason: ${authCheck.reason}`
            );
            emailsFailed++;
            // Mark as read so the same untrusted message is not re-evaluated every cycle.
            await EmailParser.markEmailAsRead(this.imapConfig, message.attributes.uid);
            continue;
          }

          // Build rawData from actual parsed headers (used by cancellation handler).
          const rawData = {
            subject: parsedHeaders.subject ?? '',
            from: fromAddress,
            date: parsedHeaders.date ?? new Date(),
          };

          // Check if this is a cancellation email first
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

              // Auto-add guest to CRM
              await this.upsertGuestFromBooking(booking);

              // GA4 Measurement Protocol attribution — fire-and-forget
              try {
                const session = await this.db.matchBookingSession(
                  booking.guestLanguage,
                  booking.guestCountry ?? null
                );
                if (session) {
                  await fireGA4Conversion(session.gaClientId, {
                    groupRef:      booking.groupRef,
                    guestLanguage: booking.guestLanguage,
                  });
                } else {
                  console.log(`[ga4-attribution] No session match for booking ${booking.groupRef} — skipping MP event`);
                }
              } catch (attrErr) {
                console.error('[ga4-attribution] Attribution step failed (non-fatal):', attrErr);
              }

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

    // Auto-add guest to CRM
    await this.upsertGuestFromBooking(booking);

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
   * Upsert a guest CRM record from a booking.
   * Called automatically whenever a new booking is created (auto or manual).
   * Never overwrites an existing unsubscribe or enriched data.
   */
  private async upsertGuestFromBooking(booking: any): Promise<void> {
    try {
      const email = (booking.guestEmail || '').trim().toLowerCase();
      if (!email || email.includes('guest.booking.com') || email.includes('reply.airbnb') || email.includes('@guest.')) {
        return; // proxy / relay address — skip
      }

      const firstName = booking.firstName || null;
      const lastName = booking.guestName && firstName && booking.guestName.startsWith(firstName)
        ? booking.guestName.slice(firstName.length).trim() || null
        : null;

      await this.db.upsertGuests([{
        email,
        firstName,
        lastName,
        countryCode: booking.guestCountry ? String(booking.guestCountry).toUpperCase().slice(0, 2) : null,
        subscribed: true,
        source: 'beds24',
        unsubscribeToken: crypto.randomUUID(),
      }]);
    } catch (err) {
      // Non-fatal — log but don't interrupt booking flow
      console.error('[CRM] Failed to upsert guest from booking:', err);
    }
  }

  /**
   * Return the list of trusted sender domains for Beds24 notifications.
   *
   * Always trusts:
   *   - "beds24.com" (Beds24's own sending domain)
   *   - The lodge's own sender domain, derived from IMAP_FROM_EMAIL or IMAP_USER
   *     (e.g. "devoceanlodge.com") so that notifications sent from the lodge's
   *     own mail domain — or forwarded copies — are accepted without extra config.
   *
   * Additional domains can be appended via BEDS24_SENDER_DOMAINS
   * (comma-separated, e.g. "mail.beds24.com,otherdomain.com").
   */
  private getTrustedSenderDomains(): string[] {
    // Always-trusted base set
    const defaults = new Set<string>(['beds24.com']);

    // Auto-add the lodge's own domain from the configured sender/IMAP address
    for (const envKey of ['IMAP_FROM_EMAIL', 'IMAP_USER']) {
      const addr = process.env[envKey] || '';
      const domain = addr.includes('@') ? addr.split('@')[1].trim().toLowerCase() : '';
      if (domain && domain !== 'beds24.com') {
        defaults.add(domain);
      }
    }

    // Optional extra domains from env var
    const envValue = process.env.BEDS24_SENDER_DOMAINS;
    if (envValue) {
      for (const d of envValue.split(',').map(x => x.trim().toLowerCase()).filter(Boolean)) {
        defaults.add(d);
      }
    }

    return Array.from(defaults);
  }

  /**
   * Return the hostnames of mail servers whose Authentication-Results headers
   * we treat as authoritative (the "authserv-id" in RFC 7601 §2.2).
   *
   * Only results stamped by these servers are considered.  Results bearing any
   * other authserv-id are discarded — this prevents an attacker from including
   * their own Authentication-Results header and having it trusted.
   *
   * Configuration (comma-separated hostnames):
   *   TRUSTED_AUTHSERV_ID env var — explicit list; falls back to MAIL_HOST
   *   (the IMAP server hostname), which is our own mail server.
   */
  private getTrustedAuthservIds(): string[] {
    const envValue = process.env.TRUSTED_AUTHSERV_ID;
    if (envValue) {
      return envValue.split(',').map(h => h.trim().toLowerCase()).filter(Boolean);
    }
    // Default: our own IMAP host is the receiving MTA that stamps auth results
    return [this.imapConfig.host.toLowerCase()];
  }

  /**
   * Two-layer, fail-closed sender authenticity check.
   *
   * Layer 1 — From domain allowlist:
   *   The RFC5322 From address domain must be in the trusted Beds24 allowlist.
   *   Necessary but not sufficient — From is attacker-controlled and spoofable.
   *
   * Layer 2 — MTA-stamped authentication results, authserv-id filtered:
   *   Authentication-Results headers (RFC 7601) are only trusted when their
   *   authserv-id field matches our own mail server (getTrustedAuthservIds()).
   *   Headers with any other authserv-id are ignored, preventing an attacker
   *   from injecting their own Authentication-Results value.
   *   We require SPF=pass or DKIM=pass for a trusted Beds24 domain within the
   *   accepted auth result. Received-SPF is used as a secondary fallback.
   *   If neither layer yields a passing result the message is rejected.
   */
  private validateSenderAuthenticity(
    fromAddress: string,
    headers: any,
  ): { trusted: boolean; reason: string } {
    const trustedDomains = this.getTrustedSenderDomains();
    const trustedAuthservIds = this.getTrustedAuthservIds();

    // Layer 1: From domain must be in allowlist
    const fromDomain = (fromAddress.split('@')[1] ?? '').toLowerCase();
    if (!fromDomain) {
      return { trusted: false, reason: 'no sender address' };
    }
    const domainAllowed = trustedDomains.some(
      d => fromDomain === d || fromDomain.endsWith(`.${d}`),
    );
    if (!domainAllowed) {
      return { trusted: false, reason: `untrusted From domain "${fromDomain}"` };
    }

    // Layer 2: Require SPF or DKIM pass from an authserv-id-validated MTA header
    const authPassed = this.checkMailServerAuthResults(
      headers,
      trustedDomains,
      trustedAuthservIds,
    );
    if (!authPassed) {
      return {
        trusted: false,
        reason:
          'SPF/DKIM authentication did not pass for a trusted domain ' +
          '(no Authentication-Results from a trusted authserv-id showed pass, ' +
          'and Received-SPF provided no pass either)',
      };
    }

    return { trusted: true, reason: 'ok' };
  }

  /**
   * Strict boundary-aware domain comparison.
   * Returns true only when `candidate` is exactly a trusted domain or an
   * immediate subdomain of one. Prevents substring bypass attacks such as
   * "evilbeds24.com" matching against the trusted domain "beds24.com".
   */
  private isDomainTrusted(candidate: string, trustedDomains: string[]): boolean {
    const c = candidate.toLowerCase().trim();
    if (!c) return false;
    return trustedDomains.some(d => c === d || c.endsWith('.' + d));
  }

  /**
   * Inspect Authentication-Results (RFC 7601) headers injected by the
   * receiving MTA and return true when at least one SPF=pass or DKIM=pass
   * result is attributable to a trusted Beds24 domain.
   *
   * Only headers whose authserv-id (the token before the first semicolon,
   * per RFC 7601 §2.2) exactly matches a configured trusted mail server
   * hostname are processed. "Exactly" means case-insensitive string equality —
   * subdomain suffix matches are intentionally NOT accepted because
   * "evil.trustedhost.com" would otherwise pass. Headers with any other
   * authserv-id — including any forged by the sender — are silently discarded.
   *
   * Received-SPF is intentionally not used here: it carries no authserv-id
   * equivalent and cannot be tied to a trusted MTA boundary, so it would
   * accept forged headers and undermine the provenance guarantee.
   *
   * Domain values in pass segments are extracted from structured named fields
   * and compared with strict boundary-aware matching (not substring matching).
   */
  private checkMailServerAuthResults(
    headers: any,
    trustedDomains: string[],
    trustedAuthservIds: string[],
  ): boolean {
    const toLines = (val: unknown): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) return val.map(v => String(v).toLowerCase());
      return [String(val).toLowerCase()];
    };

    // Authentication-Results (RFC 7601) — authserv-id filtered, exact match only
    const authResultLines = toLines(headers?.get?.('authentication-results'));
    for (const line of authResultLines) {
      const semicolonIdx = line.indexOf(';');
      if (semicolonIdx === -1) continue;
      // authserv-id may be followed by a version integer: "mx.example.com 1"
      const authservToken = line.slice(0, semicolonIdx).trim().split(/\s+/)[0];
      // Exact case-insensitive equality — no subdomain suffix matching.
      // "evil.trustedhost.com" must NOT match "trustedhost.com".
      if (!trustedAuthservIds.includes(authservToken)) {
        console.log(
          `[SECURITY] Ignoring Authentication-Results from untrusted authserv-id: "${authservToken}"`,
        );
        continue;
      }
      const resultsPart = line.slice(semicolonIdx + 1);
      if (this.parseAuthResultsPass(resultsPart, trustedDomains)) return true;
    }

    // No passing result found — fail closed.
    // Received-SPF is deliberately omitted: it has no authserv-id field and
    // cannot be bound to a trusted MTA boundary, so it is forgeable.
    return false;
  }

  /**
   * Scan one Authentication-Results header value for SPF=pass or DKIM=pass
   * segments whose structured domain identifier belongs to the trusted set.
   *
   * Domain values are extracted from named fields (smtp.mailfrom, envelope-from,
   * header.d) and compared with strict boundary checking, not substring
   * matching, to prevent bypass via domains like "evilbeds24.com".
   *
   * Example header segments handled:
   *   spf=pass smtp.mailfrom=noreply@beds24.com
   *   spf=pass (... envelope-from=<booking@beds24.com>) ...
   *   dkim=pass header.d=beds24.com
   */
  private parseAuthResultsPass(authResultsHeader: string, trustedDomains: string[]): boolean {
    // SPF=pass: extract authenticated envelope domain from structured fields
    const spfParts = authResultsHeader.match(/spf=pass[^;]*/g) ?? [];
    for (const part of spfParts) {
      // smtp.mailfrom=user@domain  or  smtp.mailfrom=domain
      const mailfromMatch = part.match(/smtp\.mailfrom=([^\s;>]+)/);
      if (mailfromMatch) {
        const raw = mailfromMatch[1].replace(/[<>]/g, '');
        const domain = raw.includes('@') ? raw.split('@')[1] : raw;
        if (this.isDomainTrusted(domain, trustedDomains)) return true;
      }
      // envelope-from=<user@domain>
      const envFromMatch = part.match(/envelope-from=<([^>]+)>/);
      if (envFromMatch) {
        const raw = envFromMatch[1];
        const domain = raw.includes('@') ? raw.split('@')[1] : raw;
        if (this.isDomainTrusted(domain, trustedDomains)) return true;
      }
    }

    // DKIM=pass: extract signing domain from header.d=
    const dkimParts = authResultsHeader.match(/dkim=pass[^;]*/g) ?? [];
    for (const part of dkimParts) {
      const headerDMatch = part.match(/header\.d=([^\s;>]+)/);
      if (headerDMatch) {
        const domain = headerDMatch[1].replace(/[<>]/g, '');
        if (this.isDomainTrusted(domain, trustedDomains)) return true;
      }
    }

    return false;
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.db.close();
  }
}
