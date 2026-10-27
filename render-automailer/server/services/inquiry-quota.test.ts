import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir, userInfo } from 'node:os';
import { join } from 'node:path';
import postgres from 'postgres';
import { createInquiryQuota, inquiryBuckets } from './inquiry-quota';

test('quota identities are hashed and recipient casing cannot bypass a bucket', () => {
  assert.deepEqual(inquiryBuckets('192.0.2.1', 'GUEST@Example.com'), inquiryBuckets('192.0.2.1', 'guest@example.com'));
  assert.ok(!JSON.stringify(inquiryBuckets('192.0.2.1', 'guest@example.com')).includes('guest@example.com'));
});

test('durable inquiry quotas serialize replicas, expire, and bound all identities', async t => {
  // An isolated, disposable database: never use the lodge database or credentials.
  try { execFileSync('initdb', ['--version'], { stdio: 'ignore' }); }
  catch { t.skip('PostgreSQL test binaries unavailable'); return; }
  const directory = mkdtempSync(join(tmpdir(), 'inquiry-quota-'));
  const data = join(directory, 'db');
  let client: ReturnType<typeof postgres> | undefined;
  let replica: ReturnType<typeof postgres> | undefined;
  let started = false;
  try {
    execFileSync('initdb', ['-D', data, '-A', 'trust', '--no-locale'], { stdio: 'ignore' });
    execFileSync('pg_ctl', ['-D', data, '-l', join(directory, 'postgres.log'), '-o', `-k ${directory} -h '' -p 16432`, '-w', 'start'], { stdio: 'ignore' });
    started = true;
    const config = { host: directory, port: 16432, database: 'postgres', username: userInfo().username, max: 5, onnotice: () => {} };
    client = postgres(config);
    replica = postgres(config);
    const reserve = createInquiryQuota(client);
    const otherReplica = createInquiryQuota(replica);
    // Initialize before racing two separate connections/process-equivalent limiters.
    await reserve('init', 'init@example.com');
    await client`TRUNCATE public_inquiry_quotas`;
    const results = await Promise.all(Array.from({ length: 20 }, (_, i) =>
      (i % 2 ? reserve : otherReplica)('192.0.2.1', `guest${i}@example.com`)));
    assert.equal(results.filter(value => value === 0).length, 3);
    assert.ok(results.filter(Boolean).every(value => value > 0 && value <= 900));
    // New limiter instance shares persisted counters (no restart reset).
    assert.ok(await createInquiryQuota(client)('192.0.2.1', 'new@example.com') > 0);
    // Expiry restores admission and cleans stale identities.
    await client`UPDATE public_inquiry_quotas SET expires_at = clock_timestamp() - interval '1 second'`;
    assert.equal(await reserve('192.0.2.1', 'new@example.com'), 0);

    await client`TRUNCATE public_inquiry_quotas`;
    for (let i = 0; i < 3; i++) assert.equal(await reserve(`ip${i}`, 'Guest@Example.com'), 0);
    assert.ok(await otherReplica('new-ip', 'guest@example.com') > 0);

    await client`TRUNCATE public_inquiry_quotas`;
    for (let i = 0; i < 20; i++) assert.equal(await reserve(`ip${i}`, `guest${i}@example.com`, 'operator@example.com'), 0);
    assert.ok(await reserve('new-ip', 'new@example.com', 'OPERATOR@example.com') > 0);

    await client`TRUNCATE public_inquiry_quotas`;
    for (let i = 0; i < 60; i++) assert.equal(await reserve(`ip${i}`, `guest${i}@example.com`), 0);
    assert.ok(await otherReplica('new-ip', 'new@example.com') > 0);
    const [global] = await client`SELECT count FROM public_inquiry_quotas WHERE bucket = 'global:day'`;
    assert.equal(global.count, 60); // Rejections do not partially consume quotas.

    await client`TRUNCATE public_inquiry_quotas`;
    await client`INSERT INTO public_inquiry_quotas VALUES ('global:day', 200, clock_timestamp() + interval '1 day')`;
    assert.ok(await reserve('new-ip', 'new@example.com') > 0);
    const [count] = await client`SELECT count(*)::int AS total FROM public_inquiry_quotas`;
    assert.equal(count.total, 1);
  } finally {
    await Promise.all([client?.end(), replica?.end()]);
    if (started) execFileSync('pg_ctl', ['-D', data, '-m', 'immediate', '-w', 'stop'], { stdio: 'ignore' });
    rmSync(directory, { recursive: true, force: true });
  }
});
