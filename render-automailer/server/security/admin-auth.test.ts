import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requireAdminKey } from './admin-auth';

test('admin authentication accepts only the exact string key and preserves error responses', () => {
  // Use a synthetic key; never read or print the configured credential.
  const descriptor = Object.getOwnPropertyDescriptor(process.env, 'ADMIN_API_KEY');
  const key = 'synthetic-admin-key-0123456789';
  function request(value: unknown) {
    let nextCalls = 0;
    const res = {
      statusCode: 200,
      body: undefined as unknown,
      status(code: number) { this.statusCode = code; return this; },
      json(body: unknown) { this.body = body; return this; },
    };
    requireAdminKey(
      { headers: { 'x-admin-key': value } } as any,
      res as any,
      () => { nextCalls++; },
    );
    return { status: res.statusCode, body: res.body, nextCalls };
  }

  try {
    process.env.ADMIN_API_KEY = key;
    assert.deepEqual(request(key), { status: 200, body: undefined, nextCalls: 1 });
    for (const value of [
      undefined, null, '', [], [key], [key, key], 42, {}, true,
      key.slice(0, -1), `${key}x`, `X${key.slice(1)}`, key.toUpperCase(),
      ` ${key}`, `${key} `, 'wrong', 'x'.repeat(10000), 'é'.repeat(key.length),
    ]) {
      assert.deepEqual(request(value), {
        status: 401,
        body: { error: 'Invalid or missing admin API key' },
        nextCalls: 0,
      });
    }

    for (const configured of [undefined, '']) {
      if (configured === undefined) delete process.env.ADMIN_API_KEY;
      else process.env.ADMIN_API_KEY = configured;
      assert.deepEqual(request(key), {
        status: 503,
        body: { error: 'Admin API key not configured on server' },
        nextCalls: 0,
      });
    }
  } finally {
    if (descriptor) Object.defineProperty(process.env, 'ADMIN_API_KEY', descriptor);
    else delete process.env.ADMIN_API_KEY;
  }
});
