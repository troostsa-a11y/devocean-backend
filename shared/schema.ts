import { pgTable, text, integer, timestamp, decimal, boolean, jsonb } from "drizzle-orm/pg-core";
import { z } from "zod";

/**
 * Bookings table - stores all booking information from Beds24 notifications
 */
export const bookings = pgTable("bookings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  
  // Beds24 references
  groupRef: text("group_ref").notNull(), // Group booking reference (e.g., 77463390)
  bookingRefs: text("booking_refs").array().notNull(), // Individual booking refs for each room
  
  // Guest information
  guestName: text("guest_name").notNull(),
  firstName: text("first_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  guestPhone: text("guest_phone"),
  guestLanguage: text("guest_language").notNull().default('EN'),
  guestGender: text("guest_gender"), // 'male', 'female', or null for unknown
  
  // Booking details
  checkInDate: timestamp("check_in_date", { mode: 'date' }).notNull(),
  checkOutDate: timestamp("check_out_date", { mode: 'date' }).notNull(),
  lastNightDate: timestamp("last_night_date", { mode: 'date' }).notNull(),
  
  // Room details (stored as JSON for multiple rooms)
  rooms: jsonb("rooms").notNull().$type<Array<{
    bookingRef: string;
    roomType: string;
    people: number;
    price: number;
    currency: string;
  }>>(),
  
  // Financial
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default('USD'),
  bookingType: text("booking_type"), // e.g., "Deposit"
  
  // Booking status
  status: text("status").notNull().default('active'), // 'active', 'cancelled', 'completed'
  cancelledAt: timestamp("cancelled_at", { mode: 'date' }),
  cancellationReason: text("cancellation_reason"),
  
  // Extras (extra beds, transfers, special requests)
  extras: jsonb("extras").$type<{
    extraBeds?: number;
    transfer?: {
      required: boolean;
      type: 'arrival' | 'departure' | 'both';
      arrivalDetails?: {
        pickupLocation: string;
        pickupTime: string;
        flightNumber?: string;
        passengers: number;
      };
      departureDetails?: {
        dropoffLocation: string;
        pickupTime: string;
        flightNumber?: string;
        passengers: number;
      };
      status?: 'pending' | 'confirmed' | 'cancelled';
      confirmationNumber?: string;
    };
    specialRequests?: string;
    dietaryRequirements?: string;
    otherExtras?: Array<{
      name: string;
      quantity: number;
      price?: number;
    }>;
  }>(),
  
  // Transfer notification sent
  transferNotificationSent: boolean("transfer_notification_sent").default(false),
  
  // Source tracking
  source: text("source").default('iframe'), // iframe, direct, etc.
  
  // Email processing status
  postBookingEmailSent: boolean("post_booking_email_sent").default(false),
  preArrivalEmailSent: boolean("pre_arrival_email_sent").default(false),
  arrivalEmailSent: boolean("arrival_email_sent").default(false),
  postDepartureEmailSent: boolean("post_departure_email_sent").default(false),
  
  // Raw email data for debugging
  rawEmailData: jsonb("raw_email_data"),
  
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

// Manual Zod schemas for validation
const roomSchema = z.object({
  bookingRef: z.string(),
  roomType: z.string(),
  people: z.number().int().positive(),
  price: z.number().positive(),
  currency: z.string().length(3),
});

const transferDetailsSchema = z.object({
  pickupLocation: z.string(),
  pickupTime: z.string(),
  flightNumber: z.string().optional(),
  passengers: z.number().int().positive(),
});

const extrasSchema = z.object({
  extraBeds: z.number().int().min(0).optional(),
  transfer: z.object({
    required: z.boolean(),
    type: z.enum(['arrival', 'departure', 'both']),
    arrivalDetails: transferDetailsSchema.optional(),
    departureDetails: transferDetailsSchema.optional(),
    status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
    confirmationNumber: z.string().optional(),
  }).optional(),
  specialRequests: z.string().optional(),
  dietaryRequirements: z.string().optional(),
  otherExtras: z.array(z.object({
    name: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().optional(),
  })).optional(),
});

export const insertBookingSchema = z.object({
  groupRef: z.string(),
  bookingRefs: z.array(z.string()),
  guestName: z.string(),
  guestEmail: z.string().email(),
  guestPhone: z.string().optional(),
  guestLanguage: z.string().default('EN'),
  checkInDate: z.date(),
  checkOutDate: z.date(),
  lastNightDate: z.date(),
  rooms: z.array(roomSchema),
  totalPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
  currency: z.string().default('USD'),
  bookingType: z.string().optional(),
  status: z.enum(['active', 'cancelled', 'completed']).default('active'),
  cancelledAt: z.date().optional(),
  cancellationReason: z.string().optional(),
  extras: extrasSchema.optional(),
  source: z.string().default('iframe'),
  rawEmailData: z.any().optional(),
});

export const insertScheduledEmailSchema = z.object({
  bookingId: z.number().int().positive(),
  emailType: z.enum(['post_booking', 'pre_arrival', 'arrival', 'post_departure']),
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
