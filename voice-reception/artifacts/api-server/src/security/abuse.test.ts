import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq, sql } from "drizzle-orm";
import * as schema from "@workspace/db/schema";

const state = vi.hoisted(() => ({ db: null as any }));
vi.mock("@workspace/db", async () => ({
  ...await import("@workspace/db/schema"),
  db: new Proxy({}, {
    get: (_target, property) => state.db[property].bind(state.db),
  }),
}));
import {
  AbuseLimitError, acquireWork, aiLimits, consumeLimits, cleanupAbuseState,
  creationLimits, enquiryLimits, loginLimits, toolLimits,
} from "./abuse";
import { hashSecret } from "./secrets";

// Real PostgreSQL SQL semantics, in an isolated in-memory database. No
// production/development database credentials, paid AI, or notifications.
let client: PGlite;
beforeAll(async () => {
  client = new PGlite();
  await client.waitReady;
  await client.exec(`
    CREATE TABLE conversations (
      id serial PRIMARY KEY, title text NOT NULL,
      created_at timestamp NOT NULL DEFAULT now()
    );
    INSERT INTO conversations (title) VALUES ('Historical staff-only chat');
  `);
  const migration = await readFile(new URL("../../../../lib/db/drizzle/0002_jittery_hobgoblin.sql", import.meta.url), "utf8");
  await client.exec(migration);
  await client.exec(migration); // Idempotent restart/retry.
  state.db = drizzle(client, { schema });
}, 15_000);
afterAll(async () => { await client?.close(); });
beforeEach(async () => { await client.exec("TRUNCATE reception_abuse_buckets, reception_work_leases"); });

describe("shared atomic quotas", () => {
  it("backfills opaque identifiers without granting access to historical chats", async () => {
    const [conversation] = await state.db.select().from(schema.conversations);
    expect(conversation.publicId).toMatch(/^[0-9a-f-]{36}$/);
    expect(conversation.accessTokenHash).toBeNull();
    const rls = await client.query<{ relrowsecurity: boolean }>(
      "SELECT relrowsecurity FROM pg_class WHERE relname IN ('reception_abuse_buckets','reception_work_leases')",
    );
    expect(rls.rows).toHaveLength(2);
    expect(rls.rows.every((row) => row.relrowsecurity)).toBe(true);
  });
  it("cannot exceed a shared counter under concurrent requests", async () => {
    const results = await Promise.allSettled(Array.from({ length: 8 }, () =>
      consumeLimits([{ key: "shared-counter", max: 3, windowMs: 60_000 }]),
    ));
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(3);
    const [bucket] = await state.db.select().from(schema.receptionAbuseBuckets);
    expect(bucket.count).toBe(3); expect(bucket.key).toBe(hashSecret("shared-counter"));
  });
  it("rolls back all reservations when any budget is exhausted", async () => {
    await consumeLimits([{ key: "z", max: 1, windowMs: 60_000 }]);
    await expect(consumeLimits([
      { key: "a", max: 5, windowMs: 60_000 }, { key: "z", max: 1, windowMs: 60_000 },
    ])).rejects.toBeInstanceOf(AbuseLimitError);
    const rows = await state.db.select().from(schema.receptionAbuseBuckets);
    expect(rows).toHaveLength(1); expect(rows[0].key).toBe(hashSecret("z"));
  });
  it("resets expired buckets using the database clock", async () => {
    await consumeLimits([{ key: "expired", max: 1, windowMs: 60_000 }]);
    await client.exec("UPDATE reception_abuse_buckets SET expires_at = now() - interval '1 second'");
    await consumeLimits([{ key: "expired", max: 1, windowMs: 60_000 }]);
    const [bucket] = await state.db.select().from(schema.receptionAbuseBuckets);
    expect(bucket.count).toBe(1); expect(bucket.expiresAt.getTime()).toBeGreaterThan(Date.now() - 1000);
  });
  it("rotating IPs and conversations does not avoid the global budget", async () => {
    for (let i = 0; i < 3; i++) {
      await consumeLimits(aiLimits(`198.51.100.${i}`, i + 1, "text").map((limit) =>
        limit.key === "ai:global:day" ? { ...limit, max: 3 } : limit,
      ));
    }
    await expect(consumeLimits(aiLimits("203.0.113.99", 99, "text").map((limit) =>
      limit.key === "ai:global:day" ? { ...limit, max: 3 } : limit,
    ))).rejects.toBeInstanceOf(AbuseLimitError);
    const [bucket] = await state.db.select().from(schema.receptionAbuseBuckets)
      .where(eq(schema.receptionAbuseBuckets.key, hashSecret("ai:global:day")));
    expect(bucket.count).toBe(3);
  });
  it("reserves more cost for voice and covers creation, login, tools and notification side effects", () => {
    expect(aiLimits("ip", 1, "text").every((limit) => limit.cost === 1)).toBe(true);
    expect(aiLimits("ip", 1, "voice").every((limit) => limit.cost === 2)).toBe(true);
    expect(aiLimits("ip", 1, "realtime").every((limit) => limit.cost === 10)).toBe(true);
    for (const limits of [creationLimits("ip"), loginLimits("ip"), toolLimits("ip", 1), enquiryLimits("ip", 1)]) {
      expect(limits.some((limit) => limit.key.includes(":global"))).toBe(true);
      expect(limits.every((limit) => limit.max > 0 && limit.windowMs > 0)).toBe(true);
    }
  });
});

describe("shared concurrency leases", () => {
  it("allows only one paid operation for a conversation and releases idempotently", async () => {
    const release = await acquireWork("198.51.100.1", 1, 60_000);
    await expect(acquireWork("198.51.100.2", 1, 60_000)).rejects.toBeInstanceOf(AbuseLimitError);
    await release(); await release();
    const second = await acquireWork("198.51.100.2", 1, 60_000);
    await second();
    expect(await state.db.select().from(schema.receptionWorkLeases)).toHaveLength(0);
  });
  it("enforces both per-IP and global slots across callers", async () => {
    const a = await acquireWork("same-ip", 1, 60_000);
    const b = await acquireWork("same-ip", 2, 60_000);
    await expect(acquireWork("same-ip", 3, 60_000)).rejects.toBeInstanceOf(AbuseLimitError);
    await a(); await b();
    const releases = await Promise.all(Array.from({ length: 8 }, (_, i) => acquireWork(`ip-${i}`, i + 1, 60_000)));
    await expect(acquireWork("other-ip", 99, 60_000)).rejects.toBeInstanceOf(AbuseLimitError);
    await Promise.all(releases.map((release) => release()));
  });
  it("expired work from a crashed replica does not block new work forever", async () => {
    await acquireWork("ip", 1, 60_000);
    await state.db.update(schema.receptionWorkLeases).set({ expiresAt: sql`now() - interval '1 second'` });
    const release = await acquireWork("ip", 1, 60_000);
    await cleanupAbuseState();
    expect(await state.db.select().from(schema.receptionWorkLeases)).toHaveLength(3);
    await release();
  });
});
