import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const integrationTokens = pgTable("integration_tokens", {
  provider: text("provider").primaryKey(),
  refreshToken: text("refresh_token").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type IntegrationToken = typeof integrationTokens.$inferSelect;
