import { DatabaseService } from './database';
import { EmailParser } from './email-parser';
import nodemailer from 'nodemailer';
import { emailTemplateRenderer } from './email-template-renderer';

/**
 * Cancellation Handler Service
 * Processes cancellation emails, stops scheduled emails, and schedules goodbye emails
 * 
 * Schedule:
 * - Cancellation emails: 1 hour after processing
 * - Standalone cancellations (booking not in DB): sent immediately
 */

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export class CancellationHandler {
  private db: DatabaseService;
  private transporter?: ReturnType<typeof nodemailer.createTransport>;
  private fromEmail: string;
  private fromName: string;
  private bccEmail?: string;

  constructor(
    db: DatabaseService,
    smtpConfig?: SMTPConfig,
    fromEmail: string = 'booking@devoceanlodge.com',
    fromName: string = 'DEVOCEAN Lodge Bookings',
    bccEmail?: string
  ) {
    this.db = db;
    if (smtpConfig) {
      this.transporter = nodemailer.createTransport(smtpConfig);
    }
    this.fromEmail = fromEmail;
    this.fromName = fromName;
    this.bccEmail = bccEmail;
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
        // Booking doesn't exist - still send goodbye email as courtesy
        const reason = this.extractCancellationReason(emailContent);
        await this.db.storePendingCancellation(groupRef, reason, rawData);
        console.log(`📋 Stored pending cancellation for booking ${groupRef} (booking not yet received)`);
        
        // Send goodbye email using data extracted from cancellation email
        if (this.transporter) {
          await this.sendStandaloneCancellationEmail(emailContent, groupRef);
        }
        
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

    // Schedule cancellation confirmation email to guest (1 hour from now)
    if (this.transporter) {
      await this.scheduleCancellationEmail(booking, reason);
    }

    console.log(`Booking ${groupRef} cancelled, ${reason ? `Reason: ${reason}` : 'No reason provided'}`);
  }

  /**
   * Schedule cancellation confirmation email to guest (1 hour from now)
   */
  private async scheduleCancellationEmail(booking: any, reason?: string): Promise<void> {
    try {
      // Calculate scheduled time: 1 hour from now (in UTC)
      const scheduledFor = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Prepare email data
      const emailData = {
        guestName: booking.guestName || 'Guest',
        firstName: booking.firstName || this.extractFirstName(booking.guestName) || 'Guest',
        gender: booking.guestGender,
        groupRef: booking.groupRef,
        checkInDate: this.formatDate(booking.checkInDate),
        checkOutDate: this.formatDate(booking.checkOutDate),
        cancelDate: this.formatDate(new Date()),
      };

      // Create scheduled email entry in database
      await this.db.createScheduledEmail({
        bookingId: booking.id,
        emailType: 'cancellation',
        recipientEmail: booking.guestEmail,
        recipientFirstname: booking.firstName || this.extractFirstName(booking.guestName) || 'Guest',
        language: booking.guestLanguage || 'en-GB',
        scheduledFor: scheduledFor,
        status: 'pending',
        templateData: emailData,
      });

      console.log(`✅ Scheduled cancellation email for ${booking.guestEmail} (${booking.guestLanguage || 'en-GB'}) - to be sent in 1 hour`);
    } catch (error) {
      console.error('Error scheduling cancellation email:', error);
    }
  }

  /**
   * Send cancellation confirmation email to guest (deprecated - now using scheduled emails)
   */
  private async sendCancellationEmail(booking: any, reason?: string): Promise<void> {
    try {
      // Render email using template renderer
      const emailData = {
        guestName: booking.guestName || 'Guest',
        firstName: booking.firstName || this.extractFirstName(booking.guestName) || 'Guest',
        gender: booking.guestGender,
        groupRef: booking.groupRef,
        checkInDate: this.formatDate(booking.checkInDate),
        checkOutDate: this.formatDate(booking.checkOutDate),
        cancelDate: this.formatDate(new Date()),
      };

      const rendered = emailTemplateRenderer.render(
        'cancellation',
        booking.guestLanguage || 'en-GB',
        emailData
      );

      // Build attachments array - include header image
      const attachments: any[] = [
        {
          filename: 'email-header.jpg',
          path: './WebsiteProject/public/images/email-header.jpg',
          cid: 'email-header-image' // Content-ID for referencing in HTML
        }
      ];

      // Send email
      await this.transporter!.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: booking.guestEmail,
        bcc: this.bccEmail, // BCC copy for record-keeping
        subject: rendered.subject,
        html: rendered.html,
        attachments
      });

      console.log(`✅ Cancellation confirmation email sent to ${booking.guestEmail} (${booking.guestLanguage || 'en-GB'})`);
    } catch (error) {
      console.error('Error sending cancellation email:', error);
    }
  }

  /**
   * Extract first name from full name (with title handling)
   */
  private extractFirstName(fullName: string): string {
    const name = fullName.trim();
    
    // Handle "Last, First" format
    if (name.includes(',')) {
      const parts = name.split(',');
      const firstName = parts[1]?.trim() || parts[0].trim();
      return this.removeTitles(firstName);
    }
    
    // Remove common titles
    const withoutTitle = this.removeTitles(name);
    
    // Take first word
    const parts = withoutTitle.split(/\s+/);
    return parts[0] || withoutTitle || 'Guest';
  }

  /**
   * Extract gender from name based on title (Mr, Mrs, Miss, Ms)
   * Returns 'male', 'female', or null if unknown
   */
  private extractGenderFromName(fullName: string): 'male' | 'female' | 'other' | null {
    const name = fullName.trim().toLowerCase();
    
    // Male titles
    if (name.match(/^(mr|mister|sir|herr)\b/i)) {
      return 'male';
    }
    
    // Female titles
    if (name.match(/^(mrs|ms|miss|madam|lady|frau|mme|mlle)\b/i)) {
      return 'female';
    }
    
    // Unknown or gender-neutral titles
    return null;
  }

  /**
   * Remove common titles from a name
   */
  private removeTitles(name: string): string {
    const titles = [
      'mr', 'mrs', 'ms', 'miss', 'dr', 'prof', 'professor',
      'sir', 'lady', 'lord', 'rev', 'reverend', 'father', 'fr'
    ];
    
    let cleaned = name.trim();
    
    for (const title of titles) {
      const regex = new RegExp(`^${title}\\.?\\s+`, 'i');
      cleaned = cleaned.replace(regex, '');
    }
    
    return cleaned.trim() || name.trim();
  }

  /**
   * Format date for email display
   */
  private formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Check if email is a cancellation notification
   */
  private isCancellationEmail(text: string): boolean {
    const lowerText = text.toLowerCase();
    
    // First, check if this is explicitly a NEW BOOKING - if so, NOT a cancellation
    if (lowerText.includes('new booking notification')) {
      return false;
    }
    
    // Check for explicit cancellation notification markers at the START of the email
    // (not just anywhere in the booking terms)
    const cancellationMarkers = [
      'cancellation notification',
      'booking cancelled',
      'reservation cancelled',
      'booking has been cancelled',
      'reservation has been cancelled',
    ];

    return cancellationMarkers.some(marker => lowerText.includes(marker));
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

  /**
   * Map country code to primary language
   * Same mapping as email-parser.ts for consistency
   */
  private countryToLanguage(countryCode: string): string | null {
    const countryLanguageMap: Record<string, string> = {
      // Portuguese-speaking countries
      'MZ': 'PT', 'PT': 'PT', 'BR': 'PT', 'AO': 'PT',
      
      // English-speaking countries
      'ZA': 'EN', 'GB': 'EN', 'US': 'EN', 'AU': 'EN', 'CA': 'EN',
      'NZ': 'EN', 'IE': 'EN', 'KE': 'EN', 'TZ': 'EN', 'UG': 'EN',
      'ZW': 'EN', 'BW': 'EN', 'NA': 'EN',
      
      // German-speaking countries
      'DE': 'DE', 'AT': 'DE', 'CH': 'DE',
      
      // French-speaking countries
      'FR': 'FR', 'BE': 'FR', 'LU': 'FR',
      
      // Spanish-speaking countries
      'ES': 'ES', 'MX': 'ES', 'AR': 'ES',
      
      // Other languages
      'IT': 'IT', 'NL': 'NL', 'SE': 'SV', 'PL': 'PL',
      'RU': 'RU', 'JP': 'JA', 'CN': 'ZH', 'HK': 'ZH', 'TW': 'ZH',
    };
    
    const code = countryCode.toUpperCase().trim();
    return countryLanguageMap[code] || null;
  }

  /**
   * Extract guest information from cancellation email
   */
  private extractGuestInfo(text: string): { name?: string; email?: string; language?: string } {
    // Extract guest name
    const nameMatch = text.match(/Name[:\s]+([^\n]+)/i);
    const name = nameMatch ? nameMatch[1].trim() : undefined;

    // Extract email
    const emailMatch = text.match(/Email[:\s]+([^\n\s]+@[^\n\s]+)/i);
    const email = emailMatch ? emailMatch[1].trim() : undefined;

    // Extract country code (usually appears after location info, lowercase 2-letter code)
    const countryMatch = text.match(/\n([a-z]{2})\s*\n/i);
    const countryCode = countryMatch ? countryMatch[1].toUpperCase() : null;

    // Language determination priority:
    // 1. Preferred Language (explicit guest preference)
    // 2. Country code mapping (inferred from guest location)
    // 3. Default to English
    const preferredLangMatch = text.match(/Preferred Language[:\s]+([A-Z]{2})/i);
    const langMatch = text.match(/Language[:\s]+([A-Z]{2})/i);
    
    let language = 'EN';
    let languageSource = 'default';
    
    if (preferredLangMatch) {
      language = preferredLangMatch[1].toUpperCase();
      languageSource = 'preferred';
    } else if (langMatch) {
      language = langMatch[1].toUpperCase();
      languageSource = 'standard';
    } else if (countryCode) {
      const countryLanguage = this.countryToLanguage(countryCode);
      if (countryLanguage) {
        language = countryLanguage;
        languageSource = 'country';
      }
    }
    
    // Log language determination for debugging
    if (languageSource === 'country') {
      console.log(`🌍 Cancellation email language derived from country: ${language} (country: ${countryCode})`);
    } else if (languageSource === 'preferred') {
      console.log(`📧 Cancellation email using Preferred Language: ${language}`);
    } else if (languageSource === 'standard') {
      console.log(`📧 Cancellation email using Language: ${language}`);
    } else {
      console.log(`📧 Cancellation email defaulting to EN (no language or country found)`);
    }

    return { name, email, language };
  }

  /**
   * Extract dates from cancellation email
   */
  private extractDates(text: string): { checkIn?: string; checkOut?: string } {
    // Extract check-in date
    const checkInMatch = text.match(/Check In[:\s]+([^\n]+)/i);
    const checkIn = checkInMatch ? checkInMatch[1].trim() : undefined;

    // Extract check-out date
    const checkOutMatch = text.match(/Check Out[:\s]+([^\n]+)/i);
    const checkOut = checkOutMatch ? checkOutMatch[1].trim() : undefined;

    return { checkIn, checkOut };
  }

  /**
   * Send standalone cancellation email (when booking doesn't exist in database)
   */
  private async sendStandaloneCancellationEmail(emailContent: string, groupRef: string): Promise<void> {
    try {
      // Extract guest information from email
      const guestInfo = this.extractGuestInfo(emailContent);
      const dates = this.extractDates(emailContent);

      if (!guestInfo.email) {
        console.log(`⚠️ Cannot send cancellation email - no guest email found in cancellation notification`);
        return;
      }

      // Extract gender from name (infer from title)
      const guestGender = this.extractGenderFromName(guestInfo.name || 'Guest');
      
      // Prepare email data
      const emailData = {
        guestName: guestInfo.name || 'Guest',
        firstName: this.extractFirstName(guestInfo.name || 'Guest'),
        gender: guestGender,
        groupRef: groupRef,
        checkInDate: dates.checkIn || 'Not specified',
        checkOutDate: dates.checkOut || 'Not specified',
        cancelDate: this.formatDate(new Date()),
      };

      // Map language code to locale (EN -> en-GB, PT -> pt-PT)
      const languageMap: Record<string, string> = {
        'EN': 'en-GB',
        'PT': 'pt-PT',
        'ES': 'es-ES',
        'FR': 'fr-FR',
        'DE': 'de-DE',
        'IT': 'it-IT',
        'NL': 'nl-NL',
      };
      const locale = languageMap[guestInfo.language || 'EN'] || 'en-GB';

      const rendered = emailTemplateRenderer.render(
        'cancellation',
        locale,
        emailData
      );

      // Build attachments array - include header image
      const attachments: any[] = [
        {
          filename: 'email-header.jpg',
          path: './WebsiteProject/public/images/email-header.jpg',
          cid: 'email-header-image' // Content-ID for referencing in HTML
        }
      ];

      // Send email
      await this.transporter!.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: guestInfo.email,
        bcc: this.bccEmail, // BCC copy for record-keeping
        subject: rendered.subject,
        html: rendered.html,
        attachments
      });

      console.log(`✅ Standalone cancellation email sent to ${guestInfo.email} (${locale}) for booking ${groupRef}`);
    } catch (error) {
      console.error('Error sending standalone cancellation email:', error);
    }
  }
}
