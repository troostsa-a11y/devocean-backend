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
    ['/chalet.html?lang=fr-FR', '/fr/chalet'],
    ['/fr/chalet.html?unit=chalet&currency=EUR', '/fr/chalet?unit=chalet&currency=EUR'],
    ['/safari.html?lang=zh', '/zh-hans/safari'],
    ['/de/legal/privacy', '/legal/privacy'],
    ['/legal/privacy?lang=de', '/legal/privacy'],
    ['/fr/legal/gdpr.html', '/legal/GDPR'],
  ])('redirects %s directly to the real document', async (path, target) => {
    const context = makeContext(path);
    const response = await onRequest(context);
    expect(response.status).toBe(301);
    expect(response.headers.get('location')).toBe(`https://devoceanlodge.com${target}`);
    expect(context.assetFetch).not.toHaveBeenCalled();
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

  it('normalizes legacy lang links once while preserving booking parameters', async () => {
    const context = makeContext('/safari?lang=pt-PT&checkIn=2026-09-15&checkOut=2026-09-18&adults=2&children=1&discount=SUMMER&currency=EUR');

    const response = await onRequest(context);
    const location = response.headers.get('location');

    expect(response.status).toBe(301);
    expect(location).toBe(
      'https://devoceanlodge.com/pt-pt/safari?checkIn=2026-09-15&checkOut=2026-09-18&adults=2&children=1&discount=SUMMER&currency=EUR',
    );
    expect(context.assetFetch).not.toHaveBeenCalled();
  });
});