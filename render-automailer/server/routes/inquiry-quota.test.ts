import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInquiryQuotaHandler } from './inquiry-quota';

async function request(db: any, body: any = { ip: '192.0.2.1', email: 'guest@example.com' }) {
  const res: any = {
    statusCode: 200, headers: {}, body: null,
    set(key: string, value: string) { this.headers[key] = value; return this; },
    status(code: number) { this.statusCode = code; return this; },
    json(value: any) { this.body = value; return this; },
  };
  await createInquiryQuotaHandler(() => db)({ body } as any, res);
  return res;
}

test('quota handler admits only an explicitly successful reservation', async () => {
  const res = await request({ reserveInquirySend: async () => 0 });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { allowed: true });
  assert.equal(res.headers['Cache-Control'], 'no-store');
});
test('quota handler returns quota wait and fails closed on storage failures', async () => {
  const limited = await request({ reserveInquirySend: async () => 900 });
  assert.equal(limited.statusCode, 429);
  assert.equal(limited.headers['Retry-After'], '900');
  assert.equal((await request(undefined)).statusCode, 503);
  assert.equal((await request({ reserveInquirySend: async () => { throw new Error('offline'); } })).statusCode, 503);
});
test('quota handler validates identities before touching storage', async () => {
  for (const body of [{}, { ip: 'ip', email: 'bad' }, { ip: [], email: 'guest@example.com' },
    { ip: 'ip', email: 'guest@example.com', operatorEmail: 'bad' }]) {
    assert.equal((await request({ reserveInquirySend: () => { throw new Error('should not run'); } }, body)).statusCode, 400);
  }
});
