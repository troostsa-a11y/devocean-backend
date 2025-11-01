import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import type { InsertBooking } from '../../shared/schema';

/**
 * Email Parser Service
 * Parses Beds24 booking notification emails and extracts structured data
 * Supports both direct Beds24 bookings and OTA bookings (Ostrovok, Booking.com, etc.)
 */

interface RoomBooking {
  bookingRef: string;
  roomType: string;
  people: number;
  price: number;
  currency: string;
}

interface ParsedBooking {
  groupRef: string;
  bookingRefs: string[];
  guestName: string;
  firstName: string;
  guestEmail: string;
  guestPhone?: string;
  guestLanguage: string;
  checkInDate: Date;
  checkOutDate: Date;
  lastNightDate: Date;
  rooms: RoomBooking[];
  totalPrice: string;
  currency: string;
  bookingType?: string;
  source: string;
  rawEmailData: any;
}

export class EmailParser {
  /**
   * Parse a Beds24 booking notification email
   */
  static async parseBookingEmail(emailContent: string): Promise<ParsedBooking | null> {
    try {
      // Parse the raw email
      const parsed = await simpleParser(emailContent);
      const text = parsed.text || '';
      const html = parsed.html || '';
      
      // Check if this is a Beds24 booking notification
      if (!text.includes('New Booking Notification') && !text.includes('Booking Ref:')) {
        console.log('Not a Beds24 booking notification');
        return null;
      }

      // Extract booking data using regex patterns
      const bookingData = this.extractBookingData(text);
      
      if (!bookingData) {
        console.error('Failed to extract booking data from email');
        return null;
      }

      return {
        ...bookingData,
        rawEmailData: {
          subject: parsed.subject,
          from: parsed.from?.text,
          date: parsed.date,
          text: text,
          html: html?.toString() || '',
        },
      };
    } catch (error) {
      console.error('Error parsing email:', error);
      return null;
    }
  }

  /**
   * Extract booking data from email text
   */
  private static extractBookingData(text: string): Omit<ParsedBooking, 'rawEmailData'> | null {
    try {
      // Extract booking type
      const bookingTypeMatch = text.match(/Booking Type:\s*([^\n]+)/i);
      const bookingType = bookingTypeMatch ? bookingTypeMatch[1].trim() : undefined;

      // Extract all booking references first
      const bookingRefMatches = Array.from(text.matchAll(/Booking Ref:\s*(\d+)/g));
      const bookingRefs = bookingRefMatches.map(match => match[1]);

      if (bookingRefs.length === 0) {
        console.error('No booking references found');
        return null;
      }

      // Extract group reference (optional - use first booking ref as fallback for OTA bookings)
      const groupRefMatch = text.match(/Group Ref:\s*(\d+)/);
      const groupRef = groupRefMatch ? groupRefMatch[1] : bookingRefs[0];

      // Extract rooms information
      const rooms = this.extractRooms(text);
      if (rooms.length === 0) {
        console.error('No rooms found in booking');
        return null;
      }

      // Extract dates
      const checkInMatch = text.match(/Check In\s+(.+?)(?:\n|$)/i);
      const checkOutMatch = text.match(/Check Out\s+(.+?)(?:\n|$)/i);
      const lastNightMatch = text.match(/Last Night\s+(.+?)(?:\n|$)/i);

      if (!checkInMatch || !checkOutMatch) {
        console.error('Missing check-in or check-out dates');
        return null;
      }

      const checkInDate = this.parseDate(checkInMatch[1]);
      const checkOutDate = this.parseDate(checkOutMatch[1]);
      const lastNightDate = lastNightMatch ? this.parseDate(lastNightMatch[1]) : checkInDate;

      // Extract guest information
      const nameMatch = text.match(/Name\s+([^\n]+)/i);
      const emailMatch = text.match(/Email\s+([^\s\n]+)/i);
      const phoneMatch = text.match(/(\+?\d{10,15})/);
      const languageMatch = text.match(/Language\s+([A-Z]{2})/i);

      if (!nameMatch) {
        console.error('Missing guest name');
        return null;
      }

      const guestName = nameMatch[1].trim();
      const firstName = this.extractFirstName(guestName);
      // Sanitize and validate email
      const rawEmail = emailMatch && emailMatch[1].trim() ? emailMatch[1].trim().toLowerCase() : '';
      const guestEmail = this.normalizeEmail(rawEmail, groupRef);
      const guestPhone = phoneMatch ? phoneMatch[1] : undefined;
      const guestLanguage = languageMatch ? languageMatch[1].toUpperCase() : 'EN';

      // Extract total price
      const totalPriceMatch = text.match(/Total Price\s+([A-Z]{2,3})\$?([\d,]+\.?\d*)/i);
      if (!totalPriceMatch) {
        console.error('No total price found');
        return null;
      }

      const rawCurrency = totalPriceMatch[1];
      const currency = this.normalizeCurrency(rawCurrency);
      const totalPrice = totalPriceMatch[2].replace(/,/g, '');

      // Extract source - detect OTA platforms
      let source = 'iframe';
      if (text.match(/Ostrovok\s+\d+/i)) {
        source = 'ostrovok';
      } else if (text.match(/Booking\.com/i)) {
        source = 'booking.com';
      } else if (text.match(/Expedia/i)) {
        source = 'expedia';
      } else if (text.match(/Airbnb/i)) {
        source = 'airbnb';
      } else {
        // Fallback to generic pattern
        const sourceMatch = text.match(/\n([a-z]+)\s*\n/i);
        source = sourceMatch ? sourceMatch[1].toLowerCase() : 'iframe';
      }

      return {
        groupRef,
        bookingRefs,
        guestName,
        firstName,
        guestEmail,
        guestPhone,
        guestLanguage,
        checkInDate,
        checkOutDate,
        lastNightDate,
        rooms,
        totalPrice,
        currency,
        bookingType,
        source,
      };
    } catch (error) {
      console.error('Error extracting booking data:', error);
      return null;
    }
  }

  /**
   * Extract room information from email text
   */
  private static extractRooms(text: string): RoomBooking[] {
    const rooms: RoomBooking[] = [];
    
    // Try pattern WITH Group Ref first (traditional Beds24 format)
    // Pattern: Room Type followed by Booking Ref, Group Ref, People, Price
    const roomPatternWithGroupRef = /([^\n]+)\nBooking Ref:\s*(\d+)\nGroup Ref:\s*\d+\nPeople\s+(\d+)\nPrice\s+([A-Z]{2,3})\$?([\d,]+\.?\d*)/gi;
    
    let match;
    while ((match = roomPatternWithGroupRef.exec(text)) !== null) {
      const roomType = match[1].trim();
      const bookingRef = match[2];
      const people = parseInt(match[3]);
      const rawCurrency = match[4];
      const currency = this.normalizeCurrency(rawCurrency);
      const price = parseFloat(match[5].replace(/,/g, ''));

      rooms.push({
        bookingRef,
        roomType,
        people,
        price,
        currency,
      });
    }

    // If no rooms found, try pattern WITHOUT Group Ref (OTA bookings)
    if (rooms.length === 0) {
      const roomPatternWithoutGroupRef = /([^\n]+)\nBooking Ref:\s*(\d+)\nPeople\s+(\d+)\nPrice\s+([A-Z]{2,3})\$?([\d,]+\.?\d*)/gi;
      
      while ((match = roomPatternWithoutGroupRef.exec(text)) !== null) {
        const roomType = match[1].trim();
        const bookingRef = match[2];
        const people = parseInt(match[3]);
        const rawCurrency = match[4];
        const currency = this.normalizeCurrency(rawCurrency);
        const price = parseFloat(match[5].replace(/,/g, ''));

        rooms.push({
          bookingRef,
          roomType,
          people,
          price,
          currency,
        });
      }
    }

    return rooms;
  }

  /**
   * Extract first name from full name
   * Handles formats like "John Smith", "Smith, John", "John", "Mr John Smith", "Mrs. Jane Doe"
   */
  private static extractFirstName(fullName: string): string {
    const name = fullName.trim();
    
    // Handle "Last, First" format
    if (name.includes(',')) {
      const parts = name.split(',');
      const firstName = parts[1]?.trim() || parts[0].trim();
      // Remove titles from the first name
      return this.removeTitles(firstName);
    }
    
    // Remove common titles (Mr, Mrs, Ms, Miss, Dr, Prof, etc.)
    const withoutTitle = this.removeTitles(name);
    
    // Handle "First Last" or "First Middle Last" format - take first word
    const parts = withoutTitle.split(/\s+/);
    return parts[0] || withoutTitle || 'Guest';
  }

  /**
   * Remove common titles from a name
   */
  private static removeTitles(name: string): string {
    // Common titles to remove (case insensitive, with or without period)
    const titles = [
      'mr', 'mrs', 'ms', 'miss', 'dr', 'prof', 'professor',
      'sir', 'lady', 'lord', 'rev', 'reverend', 'father', 'fr',
      'capt', 'captain', 'col', 'colonel', 'maj', 'major',
      'lt', 'lieutenant', 'sgt', 'sergeant'
    ];
    
    let cleaned = name.trim();
    
    // Remove title if it's at the beginning
    for (const title of titles) {
      // Match title with optional period, followed by space
      const regex = new RegExp(`^${title}\\.?\\s+`, 'i');
      cleaned = cleaned.replace(regex, '');
    }
    
    return cleaned.trim() || name.trim();
  }

  /**
   * Normalize currency code to 3-letter ISO format
   * Handles Beds24's "US" → "USD" conversion
   */
  private static normalizeCurrency(rawCurrency: string): string {
    const currency = rawCurrency.toUpperCase().trim();
    
    // Map 2-letter codes to 3-letter ISO codes
    const currencyMap: Record<string, string> = {
      'US': 'USD',
      'EU': 'EUR',
      'GB': 'GBP',
      'ZA': 'ZAR',
      'MZ': 'MZN',
      'AU': 'AUD',
      'CA': 'CAD',
      'CN': 'CNY',
      'JP': 'JPY',
      'IN': 'INR',
      'BR': 'BRL',
      'RU': 'RUB',
    };

    // If it's a 2-letter code, try to map it
    if (currency.length === 2 && currencyMap[currency]) {
      console.log(`📊 Normalized currency: ${rawCurrency} → ${currencyMap[currency]}`);
      return currencyMap[currency];
    }

    // If it's already 3 letters, use it
    if (currency.length === 3) {
      return currency;
    }

    // Fallback to USD if unknown
    console.warn(`⚠️  Unknown currency code: ${rawCurrency}, defaulting to USD`);
    return 'USD';
  }

  /**
   * Normalize and validate email address
   * Returns valid email or deterministic placeholder
   */
  private static normalizeEmail(rawEmail: string, groupRef: string): string {
    if (!rawEmail) {
      const fallback = `unknown-${groupRef}@beds24.invalid`;
      console.log(`📧 No email provided, using fallback: ${fallback}`);
      return fallback;
    }

    // Sanitize: trim, lowercase
    const cleaned = rawEmail.trim().toLowerCase();

    // Basic email validation (RFC 5322 simplified)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (emailRegex.test(cleaned)) {
      return cleaned;
    }

    // Invalid email - use deterministic placeholder
    const fallback = `unknown-${groupRef}@beds24.invalid`;
    console.warn(`⚠️  Invalid email format: "${rawEmail}", using fallback: ${fallback}`);
    return fallback;
  }

  /**
   * Parse date string in various formats
   */
  private static parseDate(dateStr: string): Date {
    // Handle format like "Sun 26 Oct 2025" or "26 Oct 2025"
    const cleanStr = dateStr.trim();
    
    // Try to parse with Date constructor
    const parsed = new Date(cleanStr);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    // Fallback: try manual parsing for "Day DD Mon YYYY" format
    const parts = cleanStr.split(/\s+/);
    if (parts.length >= 3) {
      const dateWithoutDay = parts.slice(-3).join(' '); // Take last 3 parts (DD Mon YYYY)
      const date = new Date(dateWithoutDay);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    throw new Error(`Unable to parse date: ${dateStr}`);
  }

  /**
   * Connect to IMAP server and fetch unread emails
   */
  static async fetchUnreadEmails(config: {
    host: string;
    port: number;
    user: string;
    password: string;
    tls: boolean;
  }): Promise<any[]> {
    try {
      console.log(`Connecting to IMAP server: ${config.host}:${config.port}`);
      const connection = await imaps.connect({
        imap: {
          user: config.user,
          password: config.password,
          host: config.host,
          port: config.port,
          tls: config.tls,
          tlsOptions: { rejectUnauthorized: false },
          authTimeout: 30000, // Increased from 10s to 30s
          connTimeout: 30000, // Add connection timeout
          socketTimeout: 30000, // Add socket timeout
        },
      });
      console.log('✅ IMAP connection established');

      await connection.openBox('INBOX');

      // Search for unread emails
      const searchCriteria = ['UNSEEN'];
      const fetchOptions = {
        bodies: ['HEADER', 'TEXT', ''],
        markSeen: false, // Don't mark as read automatically
      };

      const messages = await connection.search(searchCriteria, fetchOptions);

      await connection.end();

      return messages;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  /**
   * Mark an email as read
   */
  static async markEmailAsRead(config: {
    host: string;
    port: number;
    user: string;
    password: string;
    tls: boolean;
  }, uid: number): Promise<void> {
    try {
      const connection = await imaps.connect({
        imap: {
          user: config.user,
          password: config.password,
          host: config.host,
          port: config.port,
          tls: config.tls,
          tlsOptions: { rejectUnauthorized: false },
          authTimeout: 30000, // Increased from 10s to 30s
          connTimeout: 30000, // Add connection timeout
          socketTimeout: 30000, // Add socket timeout
        },
      });

      await connection.openBox('INBOX');
      await connection.addFlags(uid, '\\Seen');
      await connection.end();
    } catch (error) {
      console.error('Error marking email as read:', error);
      throw error;
    }
  }
}
