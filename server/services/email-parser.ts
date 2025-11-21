import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import * as fs from 'fs';
import type { InsertBooking } from '../../shared/schema';

/**
 * Email Parser Service
 * Parses Beds24 booking notification emails and extracts structured data
 * Supports both direct Beds24 bookings and OTA bookings (Ostrovok, Booking.com, etc.)
 */

interface ParsedBooking {
  groupRef: string;
  bookingRefs: string[];
  guestName: string;
  firstName: string;
  guestEmail: string;
  guestPhone?: string;
  guestLanguage: string;
  guestCountry?: string;
  guestGender?: 'male' | 'female' | null;
  checkInDate: Date;
  checkOutDate: Date;
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

      // Extract dates
      const checkInMatch = text.match(/Check In\s+(.+?)(?:\n|$)/i);
      const checkOutMatch = text.match(/Check Out\s+(.+?)(?:\n|$)/i);

      if (!checkInMatch || !checkOutMatch) {
        console.error('Missing check-in or check-out dates');
        return null;
      }

      const checkInDate = this.parseDate(checkInMatch[1]);
      const checkOutDate = this.parseDate(checkOutMatch[1]);

      // Extract guest information
      const nameMatch = text.match(/Name\s+([^\n]+)/i);
      const emailMatch = text.match(/Email\s+([^\s\n]+)/i);
      const phoneMatch = text.match(/(\+?\d{10,15})/);
      
      // Check for "Preferred Language" in ALL 17 supported languages, then fallback to "Language"
      // English, German, Portuguese, Spanish, French, Italian, Dutch, Polish, Swedish,
      // Japanese, Chinese, Russian, Afrikaans, Zulu, Swahili
      // Supports both 2-letter codes (EN, DE, PT) and full names (English, Português, 日本語)
      const preferredLanguageMatch = text.match(/(?:Preferred Language|Bevorzugte Sprache|Idioma preferido|Langue préférée|Lingua preferita|Voorkeurstaal|Preferowany język|Föredraget språk|優先言語|首选语言|Предпочитаемый язык|Voorkeur taal|Ulimi olukhethiwe|Lugha inayopendelewa)\s*:?\s*([A-Za-zÀ-ÿ一-龯ぁ-ゔァ-ヴー々〆〤А-я]{2,})/i);
      const languageMatch = text.match(/Language\s+([A-Z]{2})/i);
      
      // Extract gender from booking data or infer from title
      const genderMatch = text.match(/(?:Gender|Sex)\s*:?\s*(Male|Female|M|F)/i);
      let guestGender: 'male' | 'female' | null = null;
      
      if (genderMatch) {
        const gender = genderMatch[1].toUpperCase();
        guestGender = (gender === 'MALE' || gender === 'M') ? 'male' : 
                      (gender === 'FEMALE' || gender === 'F') ? 'female' : null;
      }

      if (!nameMatch) {
        console.error('Missing guest name');
        return null;
      }

      const guestName = nameMatch[1].trim();
      
      // If gender not explicitly provided, try to infer from title
      if (!guestGender) {
        guestGender = this.extractGenderFromName(guestName);
      }
      
      const firstName = this.extractFirstName(guestName);
      // Sanitize and validate email
      const rawEmail = emailMatch && emailMatch[1].trim() ? emailMatch[1].trim().toLowerCase() : '';
      const guestEmail = this.normalizeEmail(rawEmail, groupRef);
      const guestPhone = phoneMatch ? phoneMatch[1] : undefined;
      
      // Extract country code (usually appears after location info, lowercase 2-letter code)
      // Pattern: looks for 2-letter country code after location names
      const countryMatch = text.match(/\n([a-z]{2})\s*\n/i);
      const countryCode = countryMatch ? countryMatch[1].toUpperCase() : null;
      
      // Language determination priority:
      // 1. Preferred Language (explicit guest preference)
      // 2. Country code mapping (inferred from guest location)
      // 3. Default to English
      let guestLanguage = 'EN';
      let languageSource = 'default';
      
      if (preferredLanguageMatch) {
        // Priority 1: Explicit preferred language
        const rawLang = preferredLanguageMatch[1].trim();
        guestLanguage = this.normalizeLanguage(rawLang);
        languageSource = 'preferred';
      } else if (languageMatch) {
        // Priority 1b: Standard language field
        guestLanguage = languageMatch[1].toUpperCase();
        languageSource = 'standard';
      } else if (countryCode) {
        // Priority 2: Derive from country code
        const countryLanguage = this.countryToLanguage(countryCode);
        if (countryLanguage) {
          guestLanguage = countryLanguage;
          languageSource = 'country';
        }
      }
      
      // Log which language source was used for debugging
      if (languageSource === 'preferred' && preferredLanguageMatch) {
        console.log(`📧 Using Preferred Language: ${guestLanguage} (from: ${preferredLanguageMatch[1]})`);
      } else if (languageSource === 'standard') {
        console.log(`📧 Using Language: ${guestLanguage}`);
      } else if (languageSource === 'country') {
        console.log(`🌍 Using Country-based Language: ${guestLanguage} (country: ${countryCode})`);
      } else {
        console.log(`📧 No language or country specified, defaulting to EN`);
      }

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
        guestCountry: countryCode || undefined,
        guestGender,
        checkInDate,
        checkOutDate,
        bookingType,
        source,
      };
    } catch (error) {
      console.error('Error extracting booking data:', error);
      return null;
    }
  }

  /**
   * Extract first name from full name
   * Handles formats like "John Smith", "Smith, John", "John", "Mr John Smith", "Mrs. Jane Doe"
   */
  private static extractFirstName(fullName: string): string {
    const name = fullName.trim();
    
    // Safety check - never return empty string
    if (!name) {
      return 'Guest';
    }
    
    // Handle "Last, First" format
    if (name.includes(',')) {
      const parts = name.split(',');
      const firstName = parts[1]?.trim() || parts[0].trim();
      // Remove titles from the first name
      const cleanedFirstName = this.removeTitles(firstName);
      return cleanedFirstName || firstName || 'Guest';
    }
    
    // Remove common titles (Mr, Mrs, Ms, Miss, Dr, Prof, etc.)
    const withoutTitle = this.removeTitles(name);
    
    // Handle "First Last" or "First Middle Last" format - take first word
    const parts = withoutTitle.split(/\s+/).filter(p => p.length > 0);
    const extractedFirstName = parts[0] || withoutTitle || name;
    
    // Final safety check - never return empty string
    return extractedFirstName.trim() || 'Guest';
  }

  /**
   * Extract gender from name based on title (Mr, Mrs, Miss, Ms)
   * Returns 'male', 'female', or null if unknown
   */
  private static extractGenderFromName(fullName: string): 'male' | 'female' | null {
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
  private static removeTitles(name: string): string {
    // Common titles to remove (case insensitive, with or without period)
    const titles = [
      'mr', 'mister', 'mrs', 'ms', 'miss', 'dr', 'prof', 'professor',
      'sir', 'madam', 'lady', 'lord', 'rev', 'reverend', 'father', 'fr',
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
   * Map country code to primary language
   * Used as fallback when no explicit language preference is provided
   */
  private static countryToLanguage(countryCode: string): string | null {
    const countryLanguageMap: Record<string, string> = {
      // Portuguese-speaking countries
      'MZ': 'PT', // Mozambique
      'PT': 'PT', // Portugal
      'BR': 'PT', // Brazil
      'AO': 'PT', // Angola
      
      // English-speaking countries
      'ZA': 'EN', // South Africa
      'GB': 'EN', // United Kingdom
      'US': 'EN', // United States
      'AU': 'EN', // Australia
      'CA': 'EN', // Canada
      'NZ': 'EN', // New Zealand
      'IE': 'EN', // Ireland
      'KE': 'EN', // Kenya
      'TZ': 'EN', // Tanzania
      'UG': 'EN', // Uganda
      'ZW': 'EN', // Zimbabwe
      'BW': 'EN', // Botswana
      'NA': 'EN', // Namibia
      
      // German-speaking countries
      'DE': 'DE', // Germany
      'AT': 'DE', // Austria
      'CH': 'DE', // Switzerland (multilingual, German primary)
      
      // French-speaking countries
      'FR': 'FR', // France
      'BE': 'FR', // Belgium (multilingual, French primary)
      'LU': 'FR', // Luxembourg
      
      // Spanish-speaking countries
      'ES': 'ES', // Spain
      'MX': 'ES', // Mexico
      'AR': 'ES', // Argentina
      
      // Italian-speaking countries
      'IT': 'IT', // Italy
      
      // Dutch-speaking countries
      'NL': 'NL', // Netherlands
      
      // Swedish-speaking countries
      'SE': 'SV', // Sweden
      
      // Polish-speaking countries
      'PL': 'PL', // Poland
      
      // Russian-speaking countries
      'RU': 'RU', // Russia
      
      // Japanese-speaking countries
      'JP': 'JA', // Japan
      
      // Chinese-speaking countries
      'CN': 'ZH', // China
      'HK': 'ZH', // Hong Kong
      'TW': 'ZH', // Taiwan
    };
    
    const code = countryCode.toUpperCase().trim();
    return countryLanguageMap[code] || null;
  }

  /**
   * Normalize language code to 2-letter ISO format
   * Handles full language names (Englisch, Deutsch, Français) → (EN, DE, FR)
   * Also handles both English and German field names
   */
  private static normalizeLanguage(rawLanguage: string): string {
    const lang = rawLanguage.trim().toLowerCase();
    
    // Map full language names to 2-letter ISO codes
    const languageMap: Record<string, string> = {
      // English variations
      'english': 'EN',
      'englisch': 'EN',
      'inglés': 'EN',
      'inglese': 'EN',
      'inglês': 'EN',
      'англais': 'EN',
      'engels': 'EN',
      'angielski': 'EN',
      'английский': 'EN',
      'engelska': 'EN',
      '英语': 'EN',
      '英語': 'EN',
      'en': 'EN',
      'en-gb': 'EN',
      'en-us': 'EN',
      
      // German
      'german': 'DE',
      'deutsch': 'DE',
      'alemán': 'DE',
      'alemão': 'DE',
      'tedesco': 'DE',
      'allemand': 'DE',
      'duits': 'DE',
      'niemiecki': 'DE',
      'немецкий': 'DE',
      'tyska': 'DE',
      'ドイツ語': 'DE',
      '德语': 'DE',
      'de': 'DE',
      'de-de': 'DE',
      
      // Portuguese
      'portuguese': 'PT',
      'português': 'PT',
      'portugues': 'PT',
      'portoghese': 'PT',
      'portugees': 'PT',
      'portugalski': 'PT',
      'португальский': 'PT',
      'portugisiska': 'PT',
      'ポルトガル語': 'PT',
      '葡萄牙语': 'PT',
      'pt': 'PT',
      'pt-pt': 'PT',
      'pt-br': 'PT',
      
      // Spanish
      'spanish': 'ES',
      'español': 'ES',
      'espanol': 'ES',
      'espanhol': 'ES',
      'spagnolo': 'ES',
      'espagnol': 'ES',
      'spaans': 'ES',
      'hiszpański': 'ES',
      'испанский': 'ES',
      'spanska': 'ES',
      'スペイン語': 'ES',
      '西班牙语': 'ES',
      'es': 'ES',
      'es-es': 'ES',
      
      // French
      'french': 'FR',
      'français': 'FR',
      'francais': 'FR',
      'francés': 'FR',
      'frances': 'FR',
      'francês': 'FR',
      'francese': 'FR',
      'frans': 'FR',
      'francuski': 'FR',
      'французский': 'FR',
      'franska': 'FR',
      'フランス語': 'FR',
      '法语': 'FR',
      'fr': 'FR',
      'fr-fr': 'FR',
      
      // Italian
      'italian': 'IT',
      'italiano': 'IT',
      'italienne': 'IT',
      'italiaans': 'IT',
      'włoski': 'IT',
      'итальянский': 'IT',
      'italienska': 'IT',
      'イタリア語': 'IT',
      '意大利语': 'IT',
      'it': 'IT',
      'it-it': 'IT',
      
      // Dutch
      'dutch': 'NL',
      'nederlands': 'NL',
      'niederländisch': 'NL',
      'neerlandés': 'NL',
      'neerlandês': 'NL',
      'néerlandais': 'NL',
      'olandese': 'NL',
      'holandês': 'NL',
      'niderlandzki': 'NL',
      'нидерландский': 'NL',
      'nederländska': 'NL',
      'オランダ語': 'NL',
      '荷兰语': 'NL',
      'nl': 'NL',
      'nl-nl': 'NL',
      
      // Swedish
      'swedish': 'SV',
      'svenska': 'SV',
      'schwedisch': 'SV',
      'sueco': 'SV',
      'svedese': 'SV',
      'suédois': 'SV',
      'zweeds': 'SV',
      'szwedzki': 'SV',
      'шведский': 'SV',
      'engelska': 'SV',
      'スウェーデン語': 'SV',
      '瑞典语': 'SV',
      'sv': 'SV',
      
      // Polish
      'polish': 'PL',
      'polski': 'PL',
      'polnisch': 'PL',
      'polaco': 'PL',
      'polonês': 'PL',
      'polacco': 'PL',
      'polonais': 'PL',
      'pools': 'PL',
      'польский': 'PL',
      'polska': 'PL',
      'ポーランド語': 'PL',
      '波兰语': 'PL',
      'pl': 'PL',
      
      // Afrikaans
      'afrikaans': 'AF',
      'af': 'AF',
      'af-za': 'AF',
      
      // Zulu
      'zulu': 'ZU',
      'isizulu': 'ZU',
      'zu': 'ZU',
      
      // Swahili
      'swahili': 'SW',
      'kiswahili': 'SW',
      'sw': 'SW',
      
      // Japanese
      'japanese': 'JA',
      'japanisch': 'JA',
      'japonés': 'JA',
      'japonês': 'JA',
      'japonais': 'JA',
      'giapponese': 'JA',
      'японский': 'JA',
      'japanska': 'JA',
      '日本語': 'JA',
      '日语': 'JA',
      'ja': 'JA',
      'ja-jp': 'JA',
      
      // Chinese
      'chinese': 'ZH',
      'chinesisch': 'ZH',
      'chino': 'ZH',
      'chinês': 'ZH',
      'chinois': 'ZH',
      'cinese': 'ZH',
      'китайский': 'ZH',
      'kinesiska': 'ZH',
      '中文': 'ZH',
      'zh': 'ZH',
      'zh-cn': 'ZH',
      
      // Russian
      'russian': 'RU',
      'russisch': 'RU',
      'ruso': 'RU',
      'russo': 'RU',
      'russe': 'RU',
      'русский': 'RU',
      'ryska': 'RU',
      'ru': 'RU',
    };
    
    const normalized = languageMap[lang];
    
    if (normalized) {
      console.log(`🌍 Normalized language: ${rawLanguage} → ${normalized}`);
      return normalized;
    }
    
    // If not found, try to use first 2 letters as fallback
    const fallback = rawLanguage.substring(0, 2).toUpperCase();
    console.warn(`⚠️ Unknown language "${rawLanguage}", using fallback: ${fallback}`);
    return fallback;
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
