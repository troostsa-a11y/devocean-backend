const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY_MS = 500;

/**
 * Wraps a Drizzle DB operation with exponential-backoff retries.
 *
 * Emits console.warn on each failed attempt so the retry sequence is visible
 * in Render logs. Rethrows the last error if all attempts are exhausted.
 *
 * @param fn         The async DB operation to attempt.
 * @param maxRetries Total number of attempts (default 3).
 * @param baseDelayMs Base delay in ms; doubles on each retry (default 500).
 */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = DEFAULT_MAX_RETRIES,
  baseDelayMs: number = DEFAULT_BASE_DELAY_MS,
): Promise<T> {
  let lastErr: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;

      if (attempt < maxRetries) {
        const delayMs = baseDelayMs * 2 ** (attempt - 1);
        console.warn(
          `[db-retry] attempt ${attempt}/${maxRetries} failed — retrying in ${delayMs} ms`,
          err,
        );
        await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  console.error(`[db-retry] all ${maxRetries} attempts failed`, lastErr);
  throw lastErr;
}
