import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@workspace/db";
import { logger } from "./lib/logger";

// Resolve the migrations folder relative to the bundle file (import.meta.url), NOT process.cwd().
// process.cwd() differs between environments: Render rootDir = voice-reception/ (correct),
// but in Replit dev the pnpm script runs from artifacts/api-server/ (wrong).
// import.meta.url always points at the bundle (dist/index.mjs) in both environments,
// so ../../../lib/db/drizzle reliably reaches voice-reception/lib/db/drizzle.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(__dirname, "../../../lib/db/drizzle");

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1_000;

/**
 * Returns true for errors that will never succeed on retry — wrong password,
 * unknown host, SSL certificate mismatch, missing role, etc.
 * These are distinct from transient errors (ECONNREFUSED, ETIMEDOUT, DB cold-
 * start) where the server is simply not ready yet and a retry makes sense.
 */
export function isPermanentError(err: unknown): boolean {
  const code = (err as NodeJS.ErrnoException | undefined)?.code ?? "";
  const message =
    err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();

  // Unknown host — DNS will not resolve on retry
  if (code === "ENOTFOUND") return true;

  // Auth / role failures — the credentials are wrong; retrying won't help
  if (
    message.includes("password authentication failed") ||
    message.includes("authentication failed") ||
    message.includes("sasl") ||
    message.includes("role") && message.includes("does not exist")
  )
    return true;

  // SSL / TLS certificate mismatch
  if (
    message.includes("ssl") ||
    message.includes("certificate") ||
    code === "DEPTH_ZERO_SELF_SIGNED_CERT" ||
    code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
    code === "CERT_HAS_EXPIRED"
  )
    return true;

  return false;
}

export async function runMigrations(): Promise<void> {
  logger.info({ migrationsFolder }, "Running database migrations…");

  let lastErr: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await migrate(db, { migrationsFolder });
      logger.info("Database migrations complete");
      return;
    } catch (err) {
      lastErr = err;

      if (isPermanentError(err)) {
        logger.error(
          { err },
          "Migration failed with a permanent error (wrong credentials / host / SSL) — aborting immediately",
        );
        throw err;
      }

      if (attempt < MAX_RETRIES) {
        const delayMs = BASE_DELAY_MS * 2 ** (attempt - 1);
        logger.warn(
          { err, attempt, maxRetries: MAX_RETRIES, delayMs },
          `Migration attempt ${attempt}/${MAX_RETRIES} failed — retrying in ${delayMs} ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  logger.error(
    { err: lastErr, maxRetries: MAX_RETRIES },
    `Migration failed after ${MAX_RETRIES} attempts — aborting`,
  );
  throw lastErr;
}
