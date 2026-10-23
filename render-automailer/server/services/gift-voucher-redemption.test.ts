import assert from 'node:assert/strict';
import test from 'node:test';
import { PgDialect } from 'drizzle-orm/pg-core';
import { DatabaseService } from './database';

function captureDatabase(rows: any[] = []) {
  const service = Object.create(DatabaseService.prototype) as DatabaseService;
  const dialect = new PgDialect();
  const updates: Array<{ values: any; condition: { sql: string; params: unknown[] } }> = [];
  const reads: Array<{ sql: string; params: unknown[] }> = [];
  const raw: string[] = [];
  (service as any).db = {
    update: () => ({
      set: (values: any) => ({
        where: (condition: any) => {
          updates.push({ values, condition: dialect.sqlToQuery(condition) });
          return {
            returning: async () => rows,
            then: (resolve: any, reject: any) => Promise.resolve(undefined).then(resolve, reject),
          };
        },
      }),
    }),
    select: () => ({
      from: () => ({
        where: (condition: any) => {
          reads.push(dialect.sqlToQuery(condition));
          return { limit: async () => rows };
        },
      }),
    }),
  };
  (service as any).client = async (strings: TemplateStringsArray) => {
    raw.push(strings.join('?'));
    return rows;
  };
  return { service, updates, reads, raw };
}

test('redemption is a single conditional write with expiry and same-booking retry ownership', async () => {
  const { service, updates, reads } = captureDatabase([{ id: 1 }]);
  assert.equal(await service.redeemGiftVoucher(' gv-test-once ', 7), true);
  assert.equal(updates.length, 1);
  assert.equal(reads.length, 0, 'a read followed by an unconditional write is not atomic');
  assert.equal(updates[0].values.status, 'redeemed');
  assert.equal(updates[0].values.redeemedBookingId, 7);
  const { sql, params } = updates[0].condition;
  assert.match(sql, /"expires_at" >= \$/);
  assert.match(sql, /"redeemed_booking_id" = \$/);
  assert.match(sql, /NOT EXISTS/);
  assert.match(sql, /"direct_bookings"/);
  assert.match(sql, /"beds24_booking_id" IS NOT NULL/);
  assert.ok(params.includes('GV-TEST-ONCE'));
  assert.ok(params.includes('active') && params.includes('redeemed'));
  assert.ok(params.filter(value => value === 7).length >= 2);
});

test('losing a conditional redemption is explicitly reported rather than treated as success', async () => {
  const { service } = captureDatabase();
  assert.equal(await service.redeemGiftVoucher('GV-TEST-ONCE', 8), false);
  await assert.rejects(service.redeemGiftVoucher('GV-TEST-ONCE', undefined as any),
    /persisted direct booking/);
});

test('public voucher lookup excludes historical fulfilled credit even if its status is still active', async () => {
  const { service, reads } = captureDatabase();
  await service.getActiveGiftVoucherByCode(' gv-test-once ');
  assert.match(reads[0].sql, /NOT EXISTS/);
  assert.match(reads[0].sql, /"voucher_discount" > 0/);
  assert.match(reads[0].sql, /'confirmed'/);
  assert.match(reads[0].sql, /"beds24_booking_id" IS NOT NULL/);
  assert.ok(reads[0].params.includes('GV-TEST-ONCE'));
});

test('restoring credit requires its owner, a persisted refund and no fulfilled booking', async () => {
  const { service, updates } = captureDatabase();
  await service.releaseGiftVoucherRedemption(' gv-test-once ', 7);
  assert.deepEqual(updates[0].values, { status: 'active', redeemedAt: null, redeemedBookingId: null });
  assert.match(updates[0].condition.sql, /"redeemed_booking_id" = \$/);
  assert.match(updates[0].condition.sql, /"payment_status" = 'refunded'/);
  assert.match(updates[0].condition.sql, /NOT EXISTS/);
  assert.ok(updates[0].condition.params.includes(7));
});

test('a refunded failed checkout cannot be reclaimed by a concurrent webhook', async () => {
  const { service, raw } = captureDatabase();
  await service.claimDirectBookingForProcessing('fixture', 'pi_fixture');
  assert.match(raw[0], /payment_status <> 'refunded'/);
});
