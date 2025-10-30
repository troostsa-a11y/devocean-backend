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
      // Handle missing/empty email from OTA bookings - use a placeholder
      const guestEmail = emailMatch && emailMatch[1].trim() ? emailMatch[1].trim() : 'noemail@devocean-lodge.com';
      const guestPhone = phoneMatch ? phoneMatch[1] : undefined;
      const guestLanguage = languageMatch ? languageMatch[1].toUpperCase() : 'EN';

      // Extract total price
      const totalPriceMatch = text.match(/Total Price\s+([A-Z]{2,3})\$?([\d,]+\.?\d*)/i);
      if (!totalPriceMatch) {
        console.error('No total price found');
        return null;
      }

      const currency = totalPriceMatch[1];
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
      const currency = match[4];
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
        const currency = match[4];
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
