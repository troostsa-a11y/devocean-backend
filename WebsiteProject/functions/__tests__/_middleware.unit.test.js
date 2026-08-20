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

    expect(response.status).toBe(302);
    expect(location).toBe(
      'https://devoceanlodge.com/pt-pt/safari?checkIn=2026-09-15&checkOut=2026-09-18&adults=2&children=1&discount=SUMMER&currency=EUR',
    );
    expect(context.assetFetch).not.toHaveBeenCalled();
  });
});