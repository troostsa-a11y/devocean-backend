import { DateTime } from 'luxon';

/**
 * Timezone Utilities for DEVOCEAN Lodge Email Automation
 * 
 * All email scheduling operates in Central African Time (CAT = UTC+2)
 * CAT is the timezone for Mozambique/Ponta do Ouro (Africa/Maputo)
 */

const CAT_TIMEZONE = 'Africa/Maputo'; // UTC+2, no DST

/**
 * Get current time in CAT
 */
export function getCATNow(): DateTime {
  return DateTime.now().setZone(CAT_TIMEZONE);
}

/**
 * Convert a Date object to CAT DateTime
 */
export function toCATDateTime(date: Date): DateTime {
  return DateTime.fromJSDate(date).setZone(CAT_TIMEZONE);
}

/**
 * Create a CAT DateTime from date components
 * @param year Year
 * @param month Month (1-12)
 * @param day Day of month
 * @param hour Hour (0-23)
 * @param minute Minute (0-59)
 */
export function createCATDateTime(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0
): DateTime {
  return DateTime.fromObject(
    { year, month, day, hour, minute, second: 0, millisecond: 0 },
    { zone: CAT_TIMEZONE }
  );
}

/**
 * Set the time of day in CAT timezone
 * @param dateTime DateTime to modify
 * @param hour Hour (0-23)
 * @param minute Minute (0-59)
 */
export function setTimeInCAT(dateTime: DateTime, hour: number, minute: number = 0): DateTime {
  return dateTime.setZone(CAT_TIMEZONE).set({ hour, minute, second: 0, millisecond: 0 });
}

/**
 * Add hours to a CAT DateTime
 */
export function addHoursInCAT(dateTime: DateTime, hours: number): DateTime {
  return dateTime.setZone(CAT_TIMEZONE).plus({ hours });
}

/**
 * Add days to a CAT DateTime
 */
export function addDaysInCAT(dateTime: DateTime, days: number): DateTime {
  return dateTime.setZone(CAT_TIMEZONE).plus({ days });
}

/**
 * Convert CAT DateTime to UTC Date for database storage
 */
export function toUTCDate(catDateTime: DateTime): Date {
  return catDateTime.toUTC().toJSDate();
}

/**
 * Format a DateTime for logging (shows both CAT and UTC)
 */
export function formatForLog(dateTime: DateTime): string {
  const cat = dateTime.setZone(CAT_TIMEZONE);
  const utc = dateTime.toUTC();
  return `${cat.toISO()} CAT (${utc.toISO()} UTC)`;
}
