import { index, integer, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Shared across replicas: restarting or scaling the API does not reset budgets.
// Keys are hashed, never raw IP addresses or guest credentials.
export const receptionAbuseBuckets = pgTable("reception_abuse_buckets", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, (table) => [index("reception_abuse_buckets_expiry_idx").on(table.expiresAt)]).enableRLS();

export const receptionWorkLeases = pgTable("reception_work_leases", {
  leaseId: uuid("lease_id").notNull(),
  scope: text("scope").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, (table) => [
  primaryKey({ columns: [table.leaseId, table.scope] }),
  index("reception_work_leases_scope_expiry_idx").on(table.scope, table.expiresAt),
]).enableRLS();
