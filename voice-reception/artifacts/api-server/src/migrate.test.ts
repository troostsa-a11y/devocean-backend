/**
 * Unit tests for runMigrations() retry logic.
 *
 * Verifies that:
 *   - Transient errors (ECONNREFUSED, ETIMEDOUT, DB starting up) are retried
 *     exactly MAX_RETRIES (5) times and the original error is re-thrown.
 *   - Permanent errors (wrong password, ENOTFOUND, SSL) fail on the first
 *     attempt — no retry delay, migrate() called exactly once.
 *   - isPermanentError() classifies known error signatures correctly.
 *
 * Delays are skipped by mocking setTimeout at the module level so the suite
 * completes in <1 s.
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
import { runMigrations, isPermanentError } from "./migrate";

// ----------------------------------------------------------------------------

const mockMigrate = vi.mocked(migrate);

describe("runMigrations() retry behaviour", () => {
  beforeEach(() => {
    mockMigrate.mockReset();
  });

  it("retries exactly MAX_RETRIES=5 times on a transient error (ECONNREFUSED)", async () => {
    const originalError = Object.assign(new Error("connect ECONNREFUSED"), {
      code: "ECONNREFUSED",
    });
    mockMigrate.mockRejectedValue(originalError);

    await expect(runMigrations()).rejects.toThrow(originalError);

    expect(mockMigrate).toHaveBeenCalledTimes(5);
  });

  it("retries exactly MAX_RETRIES=5 times when DB is still starting up", async () => {
    const originalError = new Error(
      "the database system is starting up",
    );
    mockMigrate.mockRejectedValue(originalError);

    await expect(runMigrations()).rejects.toThrow(originalError);

    expect(mockMigrate).toHaveBeenCalledTimes(5);
  });

  it("fails immediately (1 attempt) on a permanent auth error", async () => {
    const originalError = new Error(
      "FATAL: password authentication failed for user",
    );
    mockMigrate.mockRejectedValue(originalError);

    await expect(runMigrations()).rejects.toThrow(originalError);

    expect(mockMigrate).toHaveBeenCalledTimes(1);
  });

  it("fails immediately (1 attempt) on ENOTFOUND (unknown host)", async () => {
    const originalError = Object.assign(
      new Error("getaddrinfo ENOTFOUND bad-host.example.com"),
      { code: "ENOTFOUND" },
    );
    mockMigrate.mockRejectedValue(originalError);

    await expect(runMigrations()).rejects.toThrow(originalError);

    expect(mockMigrate).toHaveBeenCalledTimes(1);
  });

  it("re-throws the original error object — not a wrapper (transient)", async () => {
    const originalError = Object.assign(new Error("connect ETIMEDOUT"), {
      code: "ETIMEDOUT",
    });
    mockMigrate.mockRejectedValue(originalError);

    const thrown = await runMigrations().catch((e: unknown) => e);

    expect(thrown).toBe(originalError);
  });

  it("re-throws the original error object — not a wrapper (permanent)", async () => {
    const originalError = new Error(
      "FATAL: password authentication failed for user",
    );
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

describe("isPermanentError()", () => {
  it("classifies ENOTFOUND as permanent", () => {
    const err = Object.assign(new Error("getaddrinfo ENOTFOUND"), {
      code: "ENOTFOUND",
    });
    expect(isPermanentError(err)).toBe(true);
  });

  it("classifies password auth failure as permanent", () => {
    expect(
      isPermanentError(
        new Error("FATAL: password authentication failed for user postgres"),
      ),
    ).toBe(true);
  });

  it("classifies SSL cert error as permanent", () => {
    const err = Object.assign(new Error("self-signed certificate"), {
      code: "DEPTH_ZERO_SELF_SIGNED_CERT",
    });
    expect(isPermanentError(err)).toBe(true);
  });

  it("classifies ECONNREFUSED as transient (not permanent)", () => {
    const err = Object.assign(new Error("connect ECONNREFUSED 127.0.0.1:5432"), {
      code: "ECONNREFUSED",
    });
    expect(isPermanentError(err)).toBe(false);
  });

  it("classifies ETIMEDOUT as transient (not permanent)", () => {
    const err = Object.assign(new Error("connect ETIMEDOUT"), {
      code: "ETIMEDOUT",
    });
    expect(isPermanentError(err)).toBe(false);
  });

  it("classifies 'database system is starting up' as transient (not permanent)", () => {
    expect(
      isPermanentError(new Error("the database system is starting up")),
    ).toBe(false);
  });
});
