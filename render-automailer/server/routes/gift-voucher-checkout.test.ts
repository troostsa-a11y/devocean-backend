import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createVoucherCheckoutHandler, createVoucherCheckoutLimiter } from './gift-voucher-checkout';

const valid = { amount: 20, purchaserName: 'Guest', purchaserEmail: 'guest@example.com' };
function harness(options: { createSession?: any; database?: any; limit?: any } = {}) {
  const sessions: any[] = [];
  const rows: any[] = [];
  const handler = createVoucherCheckoutHandler({
    createSession: options.createSession || (async input => {
      sessions.push(input);
      return { url: 'https://checkout.stripe.com/test', stripeSessionId: `cs_${sessions.length}` };
    }),
    database: options.database || (() => ({
      createGiftVoucher: async input => { rows.push(input); },
    })),
    limit: options.limit,
  });
  const request = async (body: any = valid, ip?: string) => {
    const response: any = {
      statusCode: 200, headers: {}, body: undefined,
      set(key: string, value: string) { this.headers[key] = value; return this; },
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.body = data; return this; },
    };
    await handler({ body, get: (key: string) => key === 'x-voucher-client-ip' ? ip : undefined } as any, response);
    return response;
  };
  return { request, sessions, rows };
}

test('valid checkout preserves amount, names, message, and checkout URL', async () => {
  const h = harness();
  const response = await h.request({ ...valid, recipientName: ' Friend ', message: ' Enjoy! ' }, '192.0.2.1');
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.url, 'https://checkout.stripe.com/test');
  assert.deepEqual(h.rows, [{
    amountUsd: 20, purchaserName: 'Guest', purchaserEmail: 'guest@example.com',
    recipientName: 'Friend', message: 'Enjoy!', stripeSessionId: 'cs_1',
  }]);
});

test('per-IP limit blocks concurrent attempts before Stripe or database side effects', async () => {
  const h = harness();
  const responses = await Promise.all(Array.from({ length: 20 }, (_, i) =>
    h.request({ ...valid, purchaserEmail: `guest${i}@example.com` }, '192.0.2.1')));
  assert.equal(responses.filter(r => r.statusCode === 200).length, 5);
  assert.equal(responses.filter(r => r.statusCode === 429).length, 15);
  assert.equal(h.sessions.length, 5);
  assert.equal(h.rows.length, 5);
  assert.ok(Number(responses[5].headers['Retry-After']) > 0);
  assert.equal(responses[5].headers['Cache-Control'], 'no-store');
});

test('email limits are case-insensitive and survive changing IP addresses', async () => {
  const h = harness();
  for (let i = 0; i < 5; i++) assert.equal((await h.request(valid, `192.0.2.${i}`)).statusCode, 200);
  assert.equal((await h.request({ ...valid, purchaserEmail: 'GUEST@EXAMPLE.COM' }, '192.0.2.99')).statusCode, 429);
  assert.equal(h.sessions.length, 5);
});

test('global limit caps requests even with rotating email and IP identities', async () => {
  const h = harness();
  for (let i = 0; i < 100; i++) {
    assert.equal((await h.request({ ...valid, purchaserEmail: `guest${i}@example.com` }, `192.0.2.${i}`)).statusCode, 200);
  }
  assert.equal((await h.request(valid, '198.51.100.1')).statusCode, 429);
  assert.equal(h.sessions.length, 100);
  assert.equal(h.rows.length, 100);
});

test('missing proxy identity shares a limited bucket', async () => {
  const h = harness();
  for (let i = 0; i < 5; i++) await h.request({ ...valid, purchaserEmail: `guest${i}@example.com` });
  assert.equal((await h.request({ ...valid, purchaserEmail: 'other@example.com' })).statusCode, 429);
});

test('limits expire and rejected attempts do not extend the window', () => {
  let time = 1000;
  const limit = createVoucherCheckoutLimiter(() => time);
  for (let i = 0; i < 5; i++) assert.equal(limit('192.0.2.1', 'guest@example.com'), 0);
  assert.equal(limit('192.0.2.1', 'guest@example.com'), 600);
  time += 599000;
  assert.equal(limit('192.0.2.1', 'guest@example.com'), 1);
  time += 1000;
  assert.equal(limit('192.0.2.1', 'guest@example.com'), 0);
});

test('malformed, oversized and multi-recipient input never reaches Stripe or database', async () => {
  const h = harness();
  for (const body of [
    null, [], {}, { ...valid, amount: 1 }, { ...valid, amount: '20' },
    { ...valid, purchaserEmail: ['guest@example.com'] },
    { ...valid, purchaserEmail: 'guest@example.com,other@example.com' },
    { ...valid, purchaserEmail: 'guest@example.com\r\nBcc: other@example.com' },
    { ...valid, purchaserEmail: `${'a'.repeat(250)}@example.com` },
    { ...valid, purchaserName: {} }, { ...valid, purchaserName: ' ' },
    { ...valid, purchaserName: 'x'.repeat(201) }, { ...valid, recipientName: [] },
    { ...valid, recipientName: 'x'.repeat(201) },
    { ...valid, message: {} }, { ...valid, message: 'x'.repeat(501) },
  ]) assert.equal((await h.request(body)).statusCode, 400);
  assert.equal(h.sessions.length, 0);
  assert.equal(h.rows.length, 0);
});

test('all advertised amounts still work', async () => {
  const h = harness();
  for (const amount of [20, 50, 100, 200, 500]) {
    assert.equal((await h.request({ ...valid, amount })).statusCode, 200);
  }
});

test('database unavailability fails without creating a checkout', async () => {
  const h = harness({ database: () => undefined });
  assert.equal((await h.request()).statusCode, 503);
  assert.equal(h.sessions.length, 0);
});

test('failed Stripe attempts still consume the checkout allowance and never insert rows', async () => {
  let calls = 0;
  const h = harness({ createSession: async () => {
    calls++;
    throw new Error('Fixture Stripe outage');
  } });
  for (let i = 0; i < 5; i++) assert.equal((await h.request()).statusCode, 500);
  assert.equal((await h.request()).statusCode, 429);
  assert.equal(calls, 5);
  assert.equal(h.rows.length, 0);
});
