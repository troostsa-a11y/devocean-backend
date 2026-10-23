// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAP } from '../../src/data/content.js';

const query = new URLSearchParams({
  lat: String(MAP.lat), lng: String(MAP.lng), zoom: String(MAP.zoom),
  width: '640', height: '320', scale: '1',
});
let handler;
let upstream;

function request(params = query, env = { GOOGLE_MAPS_API_KEY: 'test-only-key' }) {
  return handler({
    request: new Request(`https://example.test/api/static-map?${params}`),
    env,
  });
}

function image() {
  return new Response(new Uint8Array([137, 80, 78, 71]), {
    headers: { 'Content-Type': 'image/png' },
  });
}

beforeEach(async () => {
  vi.resetModules();
  vi.useFakeTimers();
  upstream = vi.fn().mockImplementation(async () => image());
  vi.stubGlobal('fetch', upstream);
  handler = (await import('../api/static-map.js')).onRequestGet;
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Static map paid-operation restrictions', () => {
  it.each(['1', '2'])('preserves the lodge preview at scale %s', async (scale) => {
    const params = new URLSearchParams(query);
    params.set('scale', scale);
    const response = await request(params);
    expect(response.status).toBe(200);
    expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([137, 80, 78, 71]);
    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=86400');
    const url = new URL(upstream.mock.calls[0][0]);
    expect(url.origin).toBe('https://maps.googleapis.com');
    expect(url.searchParams.get('center')).toBe(`${MAP.lat},${MAP.lng}`);
    expect(url.searchParams.get('size')).toBe('640x320');
    expect(url.searchParams.get('scale')).toBe(scale);
    expect(upstream.mock.calls[0][1].cf).toEqual({ cacheTtl: 86400, cacheEverything: true });
    expect(upstream.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it.each([
    ['lat', '0'], ['lng', '0'], ['zoom', '14'], ['width', '639'],
    ['height', '640'], ['scale', '3'], ['scale', '2junk'], ['scale', ''],
    ['lat', `${MAP.lat}&key=attacker`], ['zoom', '13&signature=attacker'],
    ['width', '640junk'], ['height', '-1'], ['lng', 'NaN'],
  ])('rejects unsupported %s=%s without an upstream call', async (key, value) => {
    const params = new URLSearchParams(query);
    params.set(key, value);
    expect((await request(params)).status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });

  it.each(['lat', 'lng', 'zoom', 'width', 'height', 'scale'])(
    'rejects duplicate %s parameters', async (key) => {
      const params = new URLSearchParams(query);
      params.append(key, params.get(key));
      expect((await request(params)).status).toBe(400);
      expect(upstream).not.toHaveBeenCalled();
    },
  );

  it.each(['lat', 'lng'])('requires %s', async (key) => {
    const params = new URLSearchParams(query);
    params.delete(key);
    expect((await request(params)).status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });

  it('retains defaults for omitted display settings', async () => {
    const params = new URLSearchParams({ lat: String(MAP.lat), lng: String(MAP.lng) });
    expect((await request(params)).status).toBe(200);
    expect(upstream.mock.calls[0][0]).toContain('zoom=13&size=640x320&scale=1');
  });

  it('fails closed without credentials', async () => {
    const response = await request(query, {});
    expect(response.status).toBe(503);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(upstream).not.toHaveBeenCalled();
  });

  it('collapses concurrent requests and arbitrary query cache busters to one fetch', async () => {
    let resolve;
    upstream.mockImplementation(() => new Promise(r => { resolve = r; }));
    const requests = Array.from({ length: 50 }, (_, n) => request(`${query}&nonce=${n}&key=ignored`));
    expect(upstream).toHaveBeenCalledTimes(1);
    resolve(image());
    const responses = await Promise.all(requests);
    expect(responses.every(r => r.status === 200)).toBe(true);
    // Each caller receives a separately consumable response body.
    expect((await Promise.all(responses.map(r => r.arrayBuffer()))).every(b => b.byteLength === 4)).toBe(true);
    expect(upstream.mock.calls[0][0]).not.toMatch(/nonce|ignored/);
    expect((await request(`${query}&nonce=later`)).status).toBe(200);
    expect(upstream).toHaveBeenCalledTimes(1);
  });

  it('uses only two fixed upstream URLs regardless of parameter order or extra parameters', async () => {
    for (const scale of ['1', '2']) {
      const params = new URLSearchParams(query);
      params.set('scale', scale);
      await request(params);
      await request(`${[...params].reverse().map(([k, v]) => `${k}=${v}`).join('&')}&cacheBust=123`);
    }
    expect(upstream).toHaveBeenCalledTimes(2);
    const [a, b] = upstream.mock.calls.map(([url]) => new URL(url));
    b.searchParams.set('scale', '1');
    expect(a.origin + a.pathname).toBe(b.origin + b.pathname);
    expect([...a.searchParams]).toEqual([...b.searchParams]);
  });

  it('refreshes only after the cache expires', async () => {
    await request();
    vi.advanceTimersByTime(86399000);
    const cached = await request(`${query}&nonce=not-a-refresh`);
    expect(cached.headers.get('Cache-Control')).toBe('public, max-age=1');
    expect(upstream).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1000);
    await request();
    expect(upstream).toHaveBeenCalledTimes(2);
  });

  it.each(['http', 'network', 'content-type', 'body', 'timeout'])(
    'throttles retries after an upstream %s failure and does not expose secrets', async (failure) => {
      upstream.mockImplementationOnce(async (_url, options) => {
        if (failure === 'network') throw new Error('https://upstream/?key=test-only-key');
        if (failure === 'timeout') {
          // The actual timeout is bounded even if Google never returns.
          return new Promise((_, reject) => options.signal.addEventListener('abort', () => reject(options.signal.reason)));
        }
        if (failure === 'http') return new Response('quota exceeded', { status: 429 });
        if (failure === 'content-type') return new Response('unexpected HTML');
        const response = image();
        vi.spyOn(response, 'arrayBuffer').mockRejectedValue(new Error('body failed'));
        return response;
      });
      const pending = request();
      if (failure === 'timeout') {
        // AbortSignal.timeout uses real Node timers, not Vitest's fake clock.
        // Fire the same cancellation event without waiting ten real seconds.
        upstream.mock.calls[0][1].signal.dispatchEvent(new Event('abort'));
      }
      const first = await pending;
      expect(first.status).toBe(503);
      expect(first.headers.get('Retry-After')).toBe('60');
      expect(first.headers.get('Cache-Control')).toBe('no-store');
      expect(await first.text()).not.toContain('test-only-key');
      for (let i = 0; i < 10; i++) expect((await request(`${query}&nonce=${i}`)).status).toBe(503);
      expect(upstream).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(60000);
      expect((await request()).status).toBe(200);
      expect(upstream).toHaveBeenCalledTimes(2);
    },
  );
});
