// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { getLegacyLocaleRedirect, onRequest, STATIC_UNIT_ASSETS } from '../_middleware.js';

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
    ['/booking?lang=ja&adults=2', '/ja/book-direct?adults=2'],
    ['/chalet.html?lang=fr-FR', '/fr/chalet'],
    ['/fr/chalet.html?unit=chalet&currency=EUR', '/fr/chalet?unit=chalet&currency=EUR'],
    ['/safari.html?lang=zh', '/zh-hans/safari'],
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

  it('redirects an incoming language query without losing any booking context', async () => {
    const context = makeContext('/safari?lang=pt-PT&checkIn=2026-09-15&checkOut=2026-09-18&adults=2&children=1&discount=SUMMER&currency=EUR');

    const response = await onRequest(context);
    expect(response.status).toBe(301);
    expect(response.headers.get('location')).toBe('https://devoceanlodge.com/pt-pt/safari?checkIn=2026-09-15&checkOut=2026-09-18&adults=2&children=1&discount=SUMMER&currency=EUR');
    expect(context.assetFetch).not.toHaveBeenCalled();
    expect(context.next).not.toHaveBeenCalled();
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
    '/de/experiences/fishing?lang=ja&currency=USD',
    '/pt-pt/safari?lang=fr',
  ])('keeps an explicit locale path authoritative over a conflicting old query: %s', async path => {
    const context = makeContext(path);
    const response = await onRequest(context);
    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
    expect(context.assetFetch).toHaveBeenCalledOnce();
  });
});

describe('bounded inbound language-query compatibility', () => {
  it.each([
    ['/?lang=fr', '/fr/'],
    ['/story?lang=de', '/de/story'],
    ['/devocean-lodge-meals?lang=pt-BR', '/pt-br/devocean-lodge-meals'],
    ['/ponta-do-ouro?lang=nl', '/nl/ponta-do-ouro'],
    ['/experiences/diving?lang=ja', '/ja/experiences/diving'],
    ['/book-direct?lang=de-DE&currency=ZAR#rooms', '/de/book-direct?currency=ZAR#rooms'],
    ['//book-direct?lang=en', '/book-direct'],
    ['/book-direct?lang=en&return_url=%2F%2Fattacker.example', '/book-direct?return_url=%2F%2Fattacker.example'],
  ])('redirects %s only to a registered document on the same origin', async (path, expected) => {
    const context = makeContext(path);
    const response = await onRequest(context);
    expect(response.status).toBe(301);
    const target = new URL(response.headers.get('location'));
    expect(target.origin).toBe('https://devoceanlodge.com');
    expect(target.href).toBe(`https://devoceanlodge.com${expected}`);
    expect(target.searchParams.has('lang')).toBe(false);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(context.assetFetch).not.toHaveBeenCalled();
    expect(context.next).not.toHaveBeenCalled();
  });

  it.each(['en-GB', 'en-US'])('hands off the explicit %s preference on root English URLs', async locale => {
    const response = await onRequest(makeContext(`/?lang=${locale}&currency=EUR`));
    expect(response.status).toBe(301);
    expect(response.headers.get('location')).toBe('https://devoceanlodge.com/?currency=EUR');
    const cookies = response.headers.getSetCookie();
    expect(cookies).toHaveLength(2);
    expect(cookies[0]).toContain(`dv_lang=${locale};`);
    expect(cookies[1]).toContain(`dv_lang_entry=${locale}; Max-Age=60;`);
    expect(cookies.every(cookie => cookie.includes('SameSite=Lax; Secure'))).toBe(true);
    expect(cookies.some(cookie => cookie.includes('currency'))).toBe(false);
  });

  it.each([
    '/api/booking/availability?lang=de',
    '/text-embed?lang=de',
    '/booking-confirmed?ref=example',
    '/gift-confirmed?session_id=example',
    '/thankyou?lang=de',
    '/legal/privacy?lang=de',
    '/assets/app.js?lang=de',
    '/unknown?lang=de',
    '/constructor?lang=de',
    '/__proto__?lang=de',
    '//attacker.example?lang=en',
    '/%2F%2Fattacker.example?lang=en',
    '/experiences/unknown?lang=de',
  ])('does not apply website compatibility to %s', path => {
    expect(getLegacyLocaleRedirect(`https://devoceanlodge.com${path}`)).toBeNull();
  });

  it.each(['not-a-locale', 'https://attacker.example', '//attacker.example', '__proto__', 'constructor'])(
    'rejects the unsupported language value %s',
    value => {
      const url = new URL('https://devoceanlodge.com/book-direct');
      url.searchParams.set('lang', value);
      expect(getLegacyLocaleRedirect(url)).toBeNull();
    },
  );
});

describe('payment-return language migration preserves transaction identifiers', () => {
  it.each([
    ['/booking-confirmed?lang=fr&ref=booking-123', '/fr/booking-confirmed?ref=booking-123'],
    ['/gift-confirmed?locale=pt-BR&session_id=cs_test_123', '/pt-br/gift-confirmed?session_id=cs_test_123'],
  ])('canonicalizes only the language on %s', async (path, expected) => {
    const response = await onRequest(makeContext(path));
    expect(response.status).toBe(301);
    expect(response.headers.get('location')).toBe(`https://devoceanlodge.com${expected}`);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it.each([
    ['/canceled', '/book-direct?canceled=1'],
    ['/canceled.html?locale=de', '/de/book-direct?canceled=1'],
    ['/canceled?lang=pt-BR&ref=retained&currency=MZN&adults=2#status',
      '/pt-br/book-direct?ref=retained&currency=MZN&adults=2&canceled=1#status'],
    ['/de/canceled?locale=ja&session_id=retained', '/de/book-direct?session_id=retained&canceled=1'],
    ['/en-us/canceled.html?lang=fr', '/book-direct?canceled=1'],
    ['/canceled?locale=__proto__&return_url=%2F%2Fattacker.example',
      '/book-direct?return_url=%2F%2Fattacker.example&canceled=1'],
    ['//canceled?lang=nl', '/nl/book-direct?canceled=1'],
  ])('opens the native cancellation state from %s', async (path, expected) => {
    const context = makeContext(path);
    const response = await onRequest(context);
    expect(response.status).toBe(303);
    const target = new URL(response.headers.get('location'));
    expect(target.origin).toBe('https://devoceanlodge.com');
    expect(target.href).toBe(`https://devoceanlodge.com${expected}`);
    expect(target.searchParams.has('lang')).toBe(false);
    expect(target.searchParams.has('locale')).toBe(false);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(context.assetFetch).not.toHaveBeenCalled();
    expect(context.next).not.toHaveBeenCalled();
  });

  it('preserves explicit US English on a historical cancellation path', async () => {
    const response = await onRequest(makeContext('/en-us/canceled?lang=fr'));
    expect(response.headers.get('set-cookie')).toContain('dv_lang_entry=en-US');
  });

  it.each(['/embed?lang=de', '/embed-text?lang=pt-BR&currency=EUR',
    '/api/openai/realtime/ws?conversationId=conversation-123&lang=de&currency=EUR'])(
    'never treats Marin transport parameters as website navigation: %s',
    path => expect(getLegacyLocaleRedirect(`https://devoceanlodge.com${path}`)).toBeNull(),
  );
});