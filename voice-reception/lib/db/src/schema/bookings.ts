import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { conversations } from "./conversations";

export const bookings = pgTable("mia_bookings", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id, {
    onDelete: "set null",
  }),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email"),
  guestPhone: text("guest_phone"),
  checkIn: text("check_in"),
  checkOut: text("check_out"),
  guests: integer("guests"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
