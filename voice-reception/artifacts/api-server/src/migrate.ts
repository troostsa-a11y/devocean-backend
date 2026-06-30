import path from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@workspace/db";
import { logger } from "./lib/logger";

// Migrations are generated from voice-reception/lib/db/ via `pnpm --filter @workspace/db exec drizzle-kit generate`.
// They live at voice-reception/lib/db/drizzle/ and are accessible at runtime because Render's rootDir
// is voice-reception/ — so process.cwd() resolves to that directory during the start command.
const migrationsFolder = path.resolve(process.cwd(), "lib/db/drizzle");

export async function runMigrations(): Promise<void> {
  logger.info({ migrationsFolder }, "Running database migrations…");
  await migrate(db, { migrationsFolder });
  logger.info("Database migrations complete");
}
