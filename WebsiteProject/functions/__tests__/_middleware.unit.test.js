// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { onRequest, STATIC_UNIT_ASSETS } from '../_middleware.js';

const UNIT_ROUTES = [...STATIC_UNIT_ASSETS.keys()];
const UNIT_HTML = `<!doctype html>
<html>
  <head><link rel="canonical" href="https://devoceanlodge.com/old" /></head>
  <body><h1>Unit</h1></body>
</html>`;

function makeContext(path) {
  const assetFetch = vi.fn(async (request) => {
    return new Response(UNIT_HTML, {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  });

  return {
    request: new Request(`https://devoceanlodge.com${path}`, {
      headers: { accept: 'text/html' },
    }),
    env: { ASSETS: { fetch: assetFetch } },
    next: vi.fn(),
    assetFetch,
  };
}

describe('legacy English redirects stay on origin', () => {
  it.each([
    ['/en-us', '/'],
    ['/en-us/', '/'],
    ['/EN-US/story?campaign=gift#details', '/story?campaign=gift#details'],
    ['/en-us//attacker.example', '/attacker.example'],
    ['/en-us///attacker.example', '/attacker.example'],
    ['/en-us/\\attacker.example', '/attacker.example'],
    ['/en-us/%5Cattacker.example', '/%5Cattacker.example'],
    ['/en-us/%2F%2Fattacker.example', '/%2F%2Fattacker.example'],
    ['/en-us//attacker.example?next=https://evil.example', '/attacker.example?next=https://evil.example'],
  ])('safely redirects %s', async (path, expected) => {
    const response = await onRequest(makeContext(path));
    expect(response.status).toBe(301);
    const target = new URL(response.headers.get('Location'));
    expect(target.origin).toBe('https://devoceanlodge.com');
    expect(target.href).toBe(`https://devoceanlodge.com${expected}`);
    expect(response.headers.get('Set-Cookie')).toContain('dv_lang=en-US');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
});

describe('Cloudflare static unit routing', () => {
  it.each(['/assets/index-CI53A5uz.js:8:35407', '/assets/index-CI53A5uz.js:2:6184',
    '/assets/file.js%3A8%3A35407'])('returns a real 404 for stack-frame URL %s', async (path) => {
    const context = makeContext(path);
    const response = await onRequest(context);
    expect(response.status).toBe(404);
    expect(context.assetFetch).not.toHaveBeenCalled();
    expect(context.next).not.toHaveBeenCalled();
  });

  it.each([
    ['/booking', '/book-direct'],
    ['/bv3/deals', '/book-direct'],
    ['/bv3/search?currency=USD', '/book-direct?currency=USD'],
    ['/booking?lang=ja&adults=2', '/book-direct?adults=2'],
    ['/chalet.html?lang=fr-FR', '/chalet'],
    ['/fr/chalet.html?unit=chalet&currency=EUR', '/fr/chalet?unit=chalet&currency=EUR'],
    ['/safari.html?lang=zh', '/safari'],
    ['/de/legal/privacy', '/legal/privacy'],
    ['/fr/legal/gdpr.html', '/legal/GDPR'],
  ])('redirects %s directly to the real document', async (path, target) => {
    const context = makeContext(path);
    const response = await onRequest(context);
    expect(response.status).toBe(301);
    expect(response.headers.get('location')).toBe(`https://devoceanlodge.com${target}`);
    expect(context.assetFetch).not.toHaveBeenCalled();
  });

  it('sends the old www booking URL directly to the canonical booking host', async () => {
    const context = makeContext('/bv3/deals');
    context.request = new Request('https://www.devoceanlodge.com/bv3/deals?currency=USD');
    const response = await onRequest(context);
    expect(response.status).toBe(301);
    expect(response.headers.get('location')).toBe('https://devoceanlodge.com/book-direct?currency=USD');
  });

  it('does not turn a missing asset into the homepage', async () => {
    const context = makeContext('/assets/unknown-resource');
    context.next.mockResolvedValue(new Response('Not found', { status: 404 }));
    const response = await onRequest(context);
    expect(response.status).toBe(404);
    expect(context.assetFetch).not.toHaveBeenCalled();
  });

  it('leaves existing JavaScript assets crawlable', async () => {
    const context = makeContext('/assets/real.js');
    context.next.mockResolvedValue(new Response('console.log("ok")', {
      headers: { 'content-type': 'application/javascript' },
    }));
    const response = await onRequest(context);
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('console.log');
  });

  it.each(UNIT_ROUTES)('renders %s from a non-canonical internal asset path', async (pathname) => {
    const context = makeContext(`${pathname}?checkIn=2026-09-15&checkOut=2026-09-18&adults=2&currency=USD`);

    const response = await onRequest(context);

    expect(response.status).toBe(200);
    expect(context.assetFetch).toHaveBeenCalledTimes(1);
    expect(new URL(context.assetFetch.mock.calls[0][0].url).pathname)
      .toBe(STATIC_UNIT_ASSETS.get(pathname));
    expect(await response.text()).toContain('https://devoceanlodge.com' + pathname);
    expect(context.next).not.toHaveBeenCalled();
  });

  it('renders a localized unit URL without redirecting back to the root route', async () => {
    const context = makeContext('/pt-pt/safari?checkIn=2026-09-15&checkOut=2026-09-18&adults=2&currency=EUR');

    const response = await onRequest(context);
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain('window.__DEVOCEAN_LOCALE__="pt-PT"');
    expect(body).toContain('https://devoceanlodge.com/pt-pt/safari');
    expect(new URL(context.assetFetch.mock.calls[0][0].url).pathname)
      .toBe('/_unit-pages/safari.unit');
  });

  it('ignores retired language queries rather than redirecting the document', async () => {
    const context = makeContext('/safari?lang=pt-PT&checkIn=2026-09-15&checkOut=2026-09-18&adults=2&children=1&discount=SUMMER&currency=EUR');

    const response = await onRequest(context);
    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
    expect(await response.text()).toContain('window.__DEVOCEAN_LOCALE__="en-GB"');
    expect(context.assetFetch).toHaveBeenCalledOnce();
  });

  it.each([
    '/back?return_url=https://attacker.example',
    '/back.html?return_url=https%3A%2F%2Fattacker.example',
    '/de/back.html?return_url=//attacker.example',
    '/%62ack%2ehtml?return_url=https://attacker.example',
    '/de/%62ack.html?return_url=https://attacker.example',
  ])('retires the unused booking return URL %s without fetching stale assets', async path => {
    const context = makeContext(path);
    const response = await onRequest(context);
    expect(response.status).toBe(410);
    expect(response.headers.get('location')).toBeNull();
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(context.assetFetch).not.toHaveBeenCalled();
    expect(context.next).not.toHaveBeenCalled();
  });

  it.each([
    '/experiences/diving?lang=ja',
    '/de/experiences/fishing?lang=ja&currency=USD',
  ])('keeps current experience URLs unchanged despite a retired language query: %s', async path => {
    const context = makeContext(path);
    const response = await onRequest(context);
    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
    expect(context.assetFetch).toHaveBeenCalledOnce();
  });
});