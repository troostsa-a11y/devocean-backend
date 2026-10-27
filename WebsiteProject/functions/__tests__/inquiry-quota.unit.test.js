import { afterEach, describe, expect, it, vi } from 'vitest';
import { onRequestPost as contact } from '../api/contact.js';
import { onRequestPost as experience } from '../api/experience-inquiry.js';

vi.mock('../_lib/captcha.js', () => ({ verifyCaptcha: vi.fn(async () => ({ success: true })) }));
import { verifyCaptcha } from '../_lib/captcha.js';

const env = { AUTOMAILER_URL: 'https://backend.example', ADMIN_API_KEY: 'test-key', RESEND_API_KEY: 'test-mail-key' };
const body = {
  name: 'Guest', email: 'Guest@Example.com', message: 'Hello', recaptcha_token: 'valid',
  operator: 'Gozo Azul Diving', operatorEmail: 'attacker@example.com', experience: 'Diving',
};
function context(overrides = {}, headers = {}, config = env) {
  return {
    env: config,
    request: new Request('https://devoceanlodge.com/api/contact', {
      method: 'POST', body: JSON.stringify({ ...body, ...overrides }),
      headers: { 'CF-Connecting-IP': '192.0.2.1', ...headers },
    }),
  };
}
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe.each([['contact', contact], ['experience', experience]])('%s send admission', (name, handler) => {
  it('reserves before sending either email and preserves normal sends', async () => {
    const fetchMock = vi.fn(async url => url.endsWith('/api/inquiry/reserve')
      ? Response.json({ allowed: true })
      : Response.json({ id: 'sent' }));
    vi.stubGlobal('fetch', fetchMock);
    expect((await handler(context({}, { 'X-Forwarded-For': 'forged' }))).status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://backend.example/api/inquiry/reserve');
    expect(options.headers['x-admin-key']).toBe('test-key');
    expect(JSON.parse(options.body)).toEqual({
      ip: '192.0.2.1', email: 'guest@example.com',
      ...(name === 'experience' ? { operatorEmail: 'natalie@gozo-azul.co.za' } : {}),
    });
    expect(options.signal).toBeDefined();
  });

  it('blocks both sends with 429 and Retry-After when quota is exhausted', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 429, headers: { 'Retry-After': '720' } }));
    vi.stubGlobal('fetch', fetchMock);
    const result = await handler(context());
    expect(result.status).toBe(429);
    expect(result.headers.get('Retry-After')).toBe('720');
    expect(result.headers.get('Cache-Control')).toBe('no-store');
    expect(result.headers.get('Access-Control-Allow-Origin')).toBe('https://devoceanlodge.com');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each(['offline', 'timeout', 'bad-json', 'unexpected-success', 'denied', 'missing-config'])(
    'fails closed without sending when quota service is %s', async failure => {
      const fetchMock = vi.fn(async () => {
        if (failure === 'offline' || failure === 'timeout') throw new Error(failure);
        if (failure === 'bad-json') return new Response('not-json');
        if (failure === 'denied') return new Response('{}', { status: 401 });
        return Response.json({ allowed: false });
      });
      vi.stubGlobal('fetch', fetchMock);
      expect((await handler(context({}, {}, failure === 'missing-config' ? {} : env))).status).toBe(503);
      expect(fetchMock).toHaveBeenCalledTimes(failure === 'missing-config' ? 0 : 1);
    },
  );

  it('rejects invalid submissions without consuming quota', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect((await handler(context({ email: 'not-email' }))).status).toBe(400);
    expect((await handler(context({ email: 'a@example.com,b@example.com' }))).status).toBe(400);
    expect((await handler(context({ name: '' }))).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not admit requests with a rejected CAPTCHA', async () => {
    vi.mocked(verifyCaptcha).mockResolvedValueOnce({ success: false, error: 'Invalid CAPTCHA' });
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect((await handler(context())).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('uses a shared fallback identity rather than trusting forwarded headers', async () => {
    const ctx = context();
    ctx.request.headers.delete('CF-Connecting-IP');
    ctx.request.headers.set('X-Forwarded-For', '192.0.2.99');
    const fetchMock = vi.fn(async () => new Response('{}', { status: 429 }));
    vi.stubGlobal('fetch', fetchMock);
    await handler(ctx);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).ip).toBe('unknown');
  });
});

it('does not reserve or send for an unlisted experience operator', async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  expect((await experience(context({ operator: 'Attacker' }))).status).toBe(400);
  expect(fetchMock).not.toHaveBeenCalled();
});
