import { createHash } from 'node:crypto';
import type postgres from 'postgres';

const hash = (value: string) => createHash('sha256').update(value.trim().toLowerCase()).digest('hex');

export function inquiryBuckets(ip: string, email: string, operatorEmail?: string) {
  return [
    { key: `ip:${hash(ip)}`, limit: 3, seconds: 15 * 60 },
    { key: `recipient:${hash(email)}`, limit: 3, seconds: 60 * 60 },
    { key: 'global:hour', limit: 60, seconds: 60 * 60 },
    { key: 'global:day', limit: 200, seconds: 24 * 60 * 60 },
    ...(operatorEmail ? [{ key: `operator:${hash(operatorEmail)}`, limit: 20, seconds: 60 * 60 }] : []),
  ];
}

/**
 * Durable, shared quotas across both forms, all edge POPs and backend replicas.
 * A transaction-level lock serializes admission: concurrent requests cannot
 * overshoot or partially consume buckets. Failed/partial sends retain their
 * reservation, since an upstream timeout does not prove no email was sent.
 */
export function createInquiryQuota(client: postgres.Sql) {
  let ready: Promise<unknown> | undefined;
  return async (ip: string, email: string, operatorEmail?: string): Promise<number> => {
    // Match the backend's existing idempotent table-initialization convention.
    // A failed initialization is retryable, but never permits an unchecked send.
    if (!ready) {
      ready = client`
        CREATE TABLE IF NOT EXISTS public_inquiry_quotas (
          bucket text PRIMARY KEY,
          count integer NOT NULL,
          expires_at timestamptz NOT NULL
        )
      `.catch(error => { ready = undefined; throw error; });
    }
    await ready;
    const buckets = inquiryBuckets(ip, email, operatorEmail);
    const result = await client.begin(async tx => {
      await tx`SET LOCAL lock_timeout = '3s'`;
      await tx`SET LOCAL statement_timeout = '3s'`;
      await tx`SELECT pg_advisory_xact_lock(638214, 1)`;
      await tx`DELETE FROM public_inquiry_quotas WHERE expires_at <= clock_timestamp()`;
      const rows = await tx`
        SELECT bucket, count,
          CEIL(EXTRACT(EPOCH FROM (expires_at - clock_timestamp()))) AS retry
        FROM public_inquiry_quotas WHERE bucket IN ${tx(buckets.map(b => b.key))}
      `;
      let retry = 0;
      for (const bucket of buckets) {
        const row = rows.find(row => row.bucket === bucket.key);
        if (row && Number(row.count) >= bucket.limit) retry = Math.max(retry, Number(row.retry), 1);
      }
      if (retry) return retry;
      for (const bucket of buckets) {
        await tx`
          INSERT INTO public_inquiry_quotas (bucket, count, expires_at)
          VALUES (${bucket.key}, 1, clock_timestamp() + ${bucket.seconds} * interval '1 second')
          ON CONFLICT (bucket) DO UPDATE SET count = public_inquiry_quotas.count + 1
        `;
      }
      return 0;
    });
    return Number(result);
  };
}
