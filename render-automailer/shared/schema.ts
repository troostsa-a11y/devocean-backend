import { pgTable, text, integer, timestamp, decimal, boolean, jsonb, serial } from "drizzle-orm/pg-core";
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
  recipientFirstname: text("recipient_firstname").notNull(),
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

/**
 * Guests table - marketing contact database
 * Merged from Mailchimp, HotelRunner, Beds24 exports
 */
export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  countryCode: text("country_code"),
  subscribed: boolean("subscribed").notNull().default(true),
  unsubscribedAt: timestamp("unsubscribed_at"),
  source: text("source").notNull().default('import'),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }),
  lastCheckin: timestamp("last_checkin"),
  tags: text("tags").array(),
  unsubscribeToken: text("unsubscribe_token").unique(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Guest = typeof guests.$inferSelect;
export type InsertGuest = typeof guests.$inferInsert;

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
  recipientFirstname: z.string(),
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

/**
 * Booking sessions table — stores GA4 client_id at the moment a visitor
 * clicks "Book Now" so the automailer can attribute confirmed bookings back
 * to the original browser session via Measurement Protocol.
 */
export const bookingSessions = pgTable("booking_sessions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  gaClientId: text("ga_client_id").notNull(),
  language:   text("language"),
  country:    text("country"),
  currency:   text("currency"),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
});

export type BookingSession = typeof bookingSessions.$inferSelect;
export type InsertBookingSession = typeof bookingSessions.$inferInsert;

/**
 * Direct bookings table — native (non-iframe) booking flow.
 *
 * Tracks the deposit/balance, Stripe references and the resulting Beds24
 * booking for reservations made through the website's own booking page.
 * A row is created in `pending` state when a Stripe Checkout session starts;
 * it is only promoted to `confirmed` (and the Beds24 booking created) from a
 * signature-verified `checkout.session.completed` webhook. The guest's
 * transactional emails + GA4 attribution still flow through the normal IMAP
 * pipeline once Beds24 emails its booking notification.
 */
export const directBookings = pgTable("direct_bookings", {
  id: serial("id").primaryKey(),

  // Our internal reference (used as the Stripe success-page key)
  sessionRef: text("session_ref").notNull().unique(),

  // Stripe references
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),

  // Room + stay
  roomId: text("room_id").notNull(),
  roomName: text("room_name"),
  checkInDate: text("check_in_date").notNull(),   // YYYY-MM-DD
  checkOutDate: text("check_out_date").notNull(),  // YYYY-MM-DD
  numAdults: integer("num_adults").notNull().default(2),
  numChildren: integer("num_children").notNull().default(0),

  // Chosen Beds24 rate plan / offer
  offerId: integer("offer_id"),
  offerName: text("offer_name"),

  // Guest
  guestFirstName: text("guest_first_name").notNull(),
  guestLastName: text("guest_last_name"),
  guestEmail: text("guest_email").notNull(),
  guestPhone: text("guest_phone"),
  guestCountry: text("guest_country"),
  guestLanguage: text("guest_language").notNull().default('EN'),

  // Money
  currency: text("currency").notNull().default('USD'),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }).notNull(),
  balanceDue: decimal("balance_due", { precision: 10, scale: 2 }).notNull(),
  depositPercent: integer("deposit_percent").notNull().default(30),

  // Coupon (optional). `discountAmount` is the whole-cart amount already
  // subtracted from `totalAmount` above (totalAmount is NET, post-discount).
  couponCode: text("coupon_code"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }),

  // Gift voucher (optional). `voucherDiscount` is deducted from totalAmount.
  voucherCode: text("voucher_code"),
  voucherDiscount: decimal("voucher_discount", { precision: 10, scale: 2 }),

  // Multi-room expansion. One leg per physical room reserved (a "per-type cart"
  // booking holds N legs). Written authoritatively at checkout and treated as
  // the source of truth at webhook time (the webhook only re-prices to guard a
  // sell-out, never to change the paid amounts). Each leg carries its own
  // occupancy, money, chosen Beds24 offer and — once created — its Beds24 id, so
  // a Stripe retry can skip already-created legs. NULL on legacy single-room rows
  // (the webhook synthesises a single leg from the scalar columns in that case).
  legs: jsonb("legs").$type<DirectBookingLeg[]>(),

  // State
  paymentStatus: text("payment_status").notNull().default('pending'), // pending | paid | refunded | refund_pending | failed | expired
  status: text("status").notNull().default('pending'),                // pending | processing | confirmed | sold_out_refunded | sold_out_refund_pending | failed
  beds24BookingId: text("beds24_booking_id"),                          // first leg's id (back-compat); all leg ids live in `legs`
  errorMessage: text("error_message"),

  // GA4 attribution (native flow): the visitor's GA4 client_id captured at
  // checkout, plus the timestamp the server-side `purchase` event was fired so
  // the IMAP email-ingest path attributes each booking exactly once.
  gaClientId: text("ga_client_id"),
  ga4ConversionFiredAt: timestamp("ga4_conversion_fired_at"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** One physical room reserved within a (possibly multi-room) direct booking. */
export interface DirectBookingLeg {
  roomId: string;
  roomName: string;
  offerId: number | null;
  offerName: string | null;
  adults: number;
  children: number;
  infants?: number;
  total: number;            // guest-facing GROSS total for this room's whole stay (pre-discount)
  discount: number;         // this leg's share of the whole-cart coupon discount
  deposit: number;          // this leg's share of the combined deposit (computed on total - discount)
  balance: number;          // this leg's balance due on arrival (computed on total - discount)
  beds24BookingId: string | null; // set once the leg is created in Beds24
}

export type DirectBooking = typeof directBookings.$inferSelect;
export type InsertDirectBooking = typeof directBookings.$inferInsert;

/**
 * Reusable phrase-discount codes (NOT Beds24's One-Time-Use Voucher Codes,
 * which are out of scope). Managed via the admin API/UI; applied by the guest
 * in the /book-direct discount code field. `code` is matched case-insensitively
 * (always stored/compared upper-cased).
 */
export const couponCodes = pgTable("coupon_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // stored upper-cased
  type: text("type").notNull(), // 'percent' | 'fixed'
  value: decimal("value", { precision: 10, scale: 2 }).notNull(), // percent (0-100) or fixed major-unit amount
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type DiscountCode = typeof couponCodes.$inferSelect;
export type InsertDiscountCode = typeof couponCodes.$inferInsert;
/** @deprecated Use DiscountCode */
export type CouponCode = DiscountCode;
/** @deprecated Use InsertDiscountCode */
export type InsertCouponCode = InsertDiscountCode;

/**
 * One-time-use gift vouchers, purchased by guests via Stripe Checkout and
 * redeemable at /book-direct. Codes are generated on the server after payment
 * confirmation (`GV-XXXX-XXXX-XXXX` format, no ambiguous chars). Status
 * lifecycle: pending → active → redeemed (or expired).
 */
export const giftVouchers = pgTable("gift_vouchers", {
  id: serial("id").primaryKey(),
  code: text("code").unique(),
  amountUsd: decimal("amount_usd", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default('pending'), // pending | active | redeemed | expired
  purchaserEmail: text("purchaser_email").notNull(),
  purchaserName: text("purchaser_name"),
  recipientName: text("recipient_name"),
  message: text("message"),
  stripeSessionId: text("stripe_session_id").unique(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  redeemedAt: timestamp("redeemed_at", { withTimezone: true }),
  redeemedBookingId: integer("redeemed_booking_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type GiftVoucher = typeof giftVouchers.$inferSelect;
export type InsertGiftVoucher = typeof giftVouchers.$inferInsert;
