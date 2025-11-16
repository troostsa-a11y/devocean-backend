import { pgTable, text, integer, timestamp, decimal, boolean, jsonb } from "drizzle-orm/pg-core";
import { z } from "zod";

/**
 * Bookings table - simplified to store only essential guest and booking information
 * Essential fields: Gender, Name, Arrival, Departure, Country, Language
 */
export const bookings = pgTable("bookings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  
  // Beds24 references (for tracking)
  groupRef: text("group_ref").notNull(),
  bookingRefs: text("booking_refs").array().notNull(),
  
  // Guest information (essential fields only)
  guestName: text("guest_name").notNull(),
  firstName: text("first_name").notNull(), // Required for email greetings
  guestGender: text("guest_gender"), // 'male', 'female', or null
  guestEmail: text("guest_email").notNull(),
  guestLanguage: text("guest_language").notNull().default('EN'),
  guestCountry: text("guest_country"), // 2-letter country code
  
  // Booking dates
  checkInDate: timestamp("check_in_date", { mode: 'date' }).notNull(),
  checkOutDate: timestamp("check_out_date", { mode: 'date' }).notNull(),
  
  // Status tracking
  status: text("status").notNull().default('active'), // 'active', 'cancelled', 'completed'
  
  // Email processing status (to avoid duplicates)
  postBookingEmailSent: boolean("post_booking_email_sent").default(false),
  preArrivalEmailSent: boolean("pre_arrival_email_sent").default(false),
  arrivalEmailSent: boolean("arrival_email_sent").default(false),
  postDepartureEmailSent: boolean("post_departure_email_sent").default(false),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Scheduled emails table - tracks emails that need to be sent
 */
export const scheduledEmails = pgTable("scheduled_emails", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  
  // Link to booking
  bookingId: integer("booking_id").notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  
  // Email details
  emailType: text("email_type").notNull(), // 'post_booking', 'pre_arrival', 'arrival', 'post_departure'
  recipientEmail: text("recipient_email").notNull(),
  recipientName: text("recipient_name").notNull(),
  language: text("language").notNull().default('EN'),
  
  // Scheduling
  scheduledFor: timestamp("scheduled_for", { mode: 'date' }).notNull(),
  sentAt: timestamp("sent_at", { mode: 'date' }),
  
  // Status
  status: text("status").notNull().default('pending'), // 'pending', 'sent', 'failed', 'cancelled'
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  
  // Email content reference
  templateData: jsonb("template_data"), // Data to populate email template
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Email logs table - audit trail of all sent emails
 */
export const emailLogs = pgTable("email_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  
  // Link to scheduled email
  scheduledEmailId: integer("scheduled_email_id").references(() => scheduledEmails.id, { onDelete: 'set null' }),
  
  // Email details
  to: text("to").notNull(),
  subject: text("subject").notNull(),
  emailType: text("email_type").notNull(),
  
  // Delivery status
  status: text("status").notNull(), // 'sent', 'failed', 'bounced'
  provider: text("provider"), // 'resend', 'sendgrid', etc.
  messageId: text("message_id"), // External provider's message ID
  
  // Error tracking
  errorMessage: text("error_message"),
  
  // Timestamps
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

/**
 * Email check logs table - tracks when email checks were performed
 */
export const emailCheckLogs = pgTable("email_check_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  
  // Check details
  checkTime: timestamp("check_time").defaultNow().notNull(),
  emailsFound: integer("emails_found").default(0),
  emailsProcessed: integer("emails_processed").default(0),
  emailsFailed: integer("emails_failed").default(0),
  
  // Status
  status: text("status").notNull(), // 'success', 'failed'
  errorMessage: text("error_message"),
  
  // Duration
  durationMs: integer("duration_ms"),
});

/**
 * Pending cancellations table - stores cancellations that arrived before booking
 */
export const pendingCancellations = pgTable("pending_cancellations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  
  // Cancellation details
  groupRef: text("group_ref").notNull(),
  cancellationReason: text("cancellation_reason"),
  
  // Tracking
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
  
  // Email content for debugging
  rawEmailData: jsonb("raw_email_data"),
});

// Simplified Zod validation schema
export const insertBookingSchema = z.object({
  groupRef: z.string(),
  bookingRefs: z.array(z.string()),
  guestName: z.string(),
  firstName: z.string(),
  guestGender: z.enum(['male', 'female']).nullable().optional(),
  guestEmail: z.string().email(),
  guestLanguage: z.string().default('EN'),
  guestCountry: z.string().length(2).optional(),
  checkInDate: z.date(),
  checkOutDate: z.date(),
  status: z.enum(['active', 'cancelled', 'completed']).default('active'),
});

export const insertScheduledEmailSchema = z.object({
  bookingId: z.number().int().positive(),
  emailType: z.enum(['post_booking', 'pre_arrival', 'arrival', 'post_departure', 'cancellation', 'transfer_notification']),
  recipientEmail: z.string().email(),
  recipientName: z.string(),
  language: z.string().default('EN'),
  scheduledFor: z.date(),
  status: z.enum(['pending', 'sent', 'failed', 'cancelled']).default('pending'),
  templateData: z.any().optional(),
});

// TypeScript types
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type ScheduledEmail = typeof scheduledEmails.$inferSelect;
export type InsertScheduledEmail = z.infer<typeof insertScheduledEmailSchema>;

export type EmailLog = typeof emailLogs.$inferSelect;
export type EmailCheckLog = typeof emailCheckLogs.$inferSelect;
