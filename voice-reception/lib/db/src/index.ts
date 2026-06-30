import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Strip sslmode from the URL so pg-connection-string doesn't inject its own
// SSL config (it currently treats sslmode=require as verify-full, which sets
// rejectUnauthorized:true and overrides the Pool-level ssl option).
// We handle SSL explicitly via the ssl option below.
const connectionString = process.env.DATABASE_URL.replace(
  /([?&])sslmode=[^&]*/,
  (_, sep) => sep === "?" ? "" : sep,
).replace(/\?$/, "");

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
export const db = drizzle(pool, { schema });

export * from "./schema";
export { withDbRetry } from "./retry";
