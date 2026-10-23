// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { onRequestPost } from '../api/gift-voucher/checkout.js';

function context(headers = {}, body = JSON.stringify({ amount: 20, purchaserName: 'Guest', purchaserEmail: 'guest@example.com' })) {
  return {
    request: new Request('https://devoceanlodge.com/api/gift-voucher/checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body,
    }),
    env: { AUTOMAILER_URL: 'https://automailer.example', ADMIN_API_KEY: 'test-key' },
  };
}
afterEach(() => vi.unstubAllGlobals());

describe('public voucher checkout proxy', () => {
  it('overwrites forged identity headers with the Cloudflare client address', async () => {
    const fetchMock = vi.fn(async () => new Response('{"url":"https://checkout.stripe.com/test"}'));
    vi.stubGlobal('fetch', fetchMock);
    const ctx = context({
      'CF-Connecting-IP': '192.0.2.1', 'x-voucher-client-ip': 'forged',
      'X-Forwarded-For': 'forged', 'x-admin-key': 'forged',
    });
    const response = await onRequestPost(ctx);
    expect(response.status).toBe(200);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://automailer.example/api/gift-voucher/checkout');
    expect(options.headers['x-voucher-client-ip']).toBe('192.0.2.1');
    expect(options.headers['x-admin-key']).toBe('test-key');
    expect(options.headers).not.toHaveProperty('X-Forwarded-For');
    expect(JSON.parse(options.body).amount).toBe(20);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('uses a shared identity when Cloudflare has no client address and relays rate limits', async () => {
    const fetchMock = vi.fn(async () => new Response('{"error":"Too many attempts"}', {
      status: 429, headers: { 'Retry-After': '600' },
    }));
    vi.stubGlobal('fetch', fetchMock);
    const response = await onRequestPost(context({ 'x-voucher-client-ip': 'forged' }));
    expect(fetchMock.mock.calls[0][1].headers['x-voucher-client-ip']).toBe('unknown');
    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('600');
  });

  it('does not proxy malformed JSON or requests without configuration', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect((await onRequestPost(context({}, '{'))).status).toBe(400);
    const ctx = context();
    ctx.env = {};
    expect((await onRequestPost(ctx)).status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
