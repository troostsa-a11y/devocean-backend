/**
 * Unit tests for runMigrations() retry logic.
 *
 * Verifies that a permanently-failing migrate() function is retried exactly
 * MAX_RETRIES (5) times and that the original error is re-thrown — not
 * swallowed and not replaced with a wrapper. Delays are skipped by mocking
 * setTimeout at the module level so the suite completes in <1 s.
 *
 * Run:
 *   pnpm --filter @workspace/api-server run test
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// --- module-level mocks (hoisted before imports) ----------------------------

vi.mock("drizzle-orm/node-postgres/migrator", () => ({
  migrate: vi.fn(),
}));

vi.mock("@workspace/db", () => ({
  db: {},
}));

vi.mock("./lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Skip real delays so the five-attempt loop finishes instantly.
vi.mock("timers/promises", () => ({
  setTimeout: vi.fn().mockResolvedValue(undefined),
}));

// Override the global setTimeout used by runMigrations' inline
// `new Promise((resolve) => setTimeout(resolve, delayMs))`.
vi.stubGlobal("setTimeout", (fn: () => void) => fn());

// --- imports after mocks ----------------------------------------------------

import { migrate } from "drizzle-orm/node-postgres/migrator";
import { runMigrations } from "./migrate";

// ----------------------------------------------------------------------------

const mockMigrate = vi.mocked(migrate);

describe("runMigrations() retry behaviour", () => {
  beforeEach(() => {
    mockMigrate.mockReset();
  });

  it("retries exactly MAX_RETRIES=5 times when migrate always fails", async () => {
    const originalError = new Error(
      "FATAL: password authentication failed for user",
    );
    mockMigrate.mockRejectedValue(originalError);

    await expect(runMigrations()).rejects.toThrow(originalError);

    expect(mockMigrate).toHaveBeenCalledTimes(5);
  });

  it("re-throws the original error object — not a wrapper", async () => {
    const originalError = new Error("connection refused");
    mockMigrate.mockRejectedValue(originalError);

    const thrown = await runMigrations().catch((e: unknown) => e);

    expect(thrown).toBe(originalError);
  });

  it("resolves immediately when the first attempt succeeds", async () => {
    mockMigrate.mockResolvedValue(undefined);

    await expect(runMigrations()).resolves.toBeUndefined();

    expect(mockMigrate).toHaveBeenCalledTimes(1);
  });
});
