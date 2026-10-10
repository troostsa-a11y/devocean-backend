import { randomUUID } from "node:crypto";
import { db, receptionAbuseBuckets as buckets, receptionWorkLeases as leases } from "@workspace/db";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import { hashSecret } from "./secrets";

export const AI_DEADLINE_MS = 60_000;
export const REALTIME_DURATION_MS = 5 * 60_000;
export const MAX_COMPLETION_TOKENS = 1024;
export const MAX_MODEL_ROUNDS = 3;
export const MAX_TOOLS_PER_TURN = 4;
export const MAX_HISTORY_MESSAGES = 40;
export const MAX_HISTORY_CHARACTERS = 24_000;

export class AbuseLimitError extends Error {
  readonly status = 429;
  constructor(readonly retryAfter = 60) { super("Too many requests. Please try again later."); }
}

export interface Limit {
  key: string;
  max: number;
  windowMs: number;
  cost?: number;
}

const minute = 60_000;
const hour = 60 * minute;
const day = 24 * hour;

// Atomic upserts in one transaction prevent races across autoscale replicas.
// A rejected limit rolls back all earlier counters in the same request.
export async function consumeLimits(limits: Limit[]): Promise<void> {
  await db.transaction(async (tx) => {
    for (const limit of [...limits].sort((a, b) => a.key.localeCompare(b.key))) {
      const cost = limit.cost ?? 1;
      const key = hashSecret(limit.key);
      const expiry = sql`now() + ${limit.windowMs} * interval '1 millisecond'`;
      const nextCount = sql`case when ${buckets.expiresAt} <= now() then ${cost} else ${buckets.count} + ${cost} end`;
      const updated = await tx.insert(buckets).values({ key, count: cost, expiresAt: expiry })
        .onConflictDoUpdate({
          target: buckets.key,
          set: {
            count: nextCount,
            expiresAt: sql`case when ${buckets.expiresAt} <= now() then ${expiry} else ${buckets.expiresAt} end`,
          },
          setWhere: sql`${nextCount} <= ${limit.max}`,
        })
        .returning({ count: buckets.count });
      if (cost > limit.max || updated.length === 0) {
        throw new AbuseLimitError(Math.ceil(limit.windowMs / 1000));
      }
    }
  });
}

export const creationLimits = (ip: string): Limit[] => [
  { key: `create:ip:short:${ip}`, max: 6, windowMs: 10 * minute },
  { key: `create:ip:day:${ip}`, max: 30, windowMs: day },
  { key: "create:global:short", max: 60, windowMs: 10 * minute },
  { key: "create:global:day", max: 600, windowMs: day },
];

export const loginLimits = (ip: string): Limit[] => [
  { key: `login:ip:${ip}`, max: 5, windowMs: 15 * minute },
  { key: "login:global", max: 100, windowMs: 15 * minute },
];

export const aiLimits = (ip: string, id: number, kind: "text" | "voice" | "realtime"): Limit[] => {
  // A five-minute relay reserves ten units up front, even if it ends early.
  const cost = kind === "realtime" ? 10 : kind === "voice" ? 2 : 1;
  return [
    { key: `ai:ip:minute:${ip}`, max: 20, windowMs: minute, cost },
    { key: `ai:ip:day:${ip}`, max: 200, windowMs: day, cost },
    { key: `ai:conversation:${id}`, max: 60, windowMs: hour, cost },
    { key: "ai:global:minute", max: 120, windowMs: minute, cost },
    { key: "ai:global:day", max: 1200, windowMs: day, cost },
  ];
};

export const toolLimits = (ip: string, id: number): Limit[] => [
  { key: `tool:ip:${ip}`, max: 60, windowMs: hour },
  { key: `tool:conversation:${id}`, max: 30, windowMs: hour },
  { key: "tool:global:hour", max: 240, windowMs: hour },
  { key: "tool:global:day", max: 2000, windowMs: day },
];

export const enquiryLimits = (ip: string, id: number): Limit[] => [
  { key: `enquiry:ip:${ip}`, max: 5, windowMs: hour },
  { key: `enquiry:conversation:${id}`, max: 3, windowMs: hour },
  { key: "enquiry:global:hour", max: 30, windowMs: hour },
  { key: "enquiry:global:day", max: 60, windowMs: day },
];

// Expiring leases also make abandoned work bounded after a crashed replica.
// Each work item has one global, IP, and conversation slot.
export async function acquireWork(ip: string, id: number, durationMs: number): Promise<() => Promise<void>> {
  const leaseId = randomUUID();
  const scopes = [
    { key: "work:global", max: 8 },
    { key: `work:ip:${ip}`, max: 2 },
    { key: `work:conversation:${id}`, max: 1 },
  ].map((scope) => ({ ...scope, key: hashSecret(scope.key) }))
    .sort((a, b) => a.key.localeCompare(b.key));
  await db.transaction(async (tx) => {
    for (const scope of scopes) {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${scope.key}, 0))`);
      const [active] = await tx.select({ count: sql<number>`count(*)::int` }).from(leases)
        .where(and(eq(leases.scope, scope.key), gt(leases.expiresAt, sql`now()`)));
      if (active.count >= scope.max) throw new AbuseLimitError(10);
      await tx.insert(leases).values({
        leaseId, scope: scope.key,
        expiresAt: sql`now() + ${durationMs + 5000} * interval '1 millisecond'`,
      });
    }
  });
  let released = false;
  return async () => {
    if (released) return;
    released = true;
    await db.delete(leases).where(eq(leases.leaseId, leaseId));
  };
}

export async function cleanupAbuseState(): Promise<void> {
  await db.delete(buckets).where(lt(buckets.expiresAt, sql`now()`));
  await db.delete(leases).where(lt(leases.expiresAt, sql`now()`));
}
