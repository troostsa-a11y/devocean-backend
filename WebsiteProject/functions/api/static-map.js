/**
 * Cloudflare Pages Function — lodge map preview, at scale=1 or scale=2.
 *
 * Proxies the Google Static Maps API so the API key stays server-side (never
 * exposed to the browser). Used by LocationSection.jsx to render a map
 * preview image before the visitor opts into the full interactive embed.
 *
 * Required Cloudflare Environment Variable:
 * - GOOGLE_MAPS_API_KEY
 *
 * This is deliberately NOT a general-purpose paid map proxy. Only the two
 * previews used by LocationSection are allowed. Never forward caller input
 * into the upstream URL or use the incoming URL as the upstream cache key.
 */
import { MAP } from '../../src/data/content.js';

const CACHE_SECONDS = 86400;
const RETRY_SECONDS = 60;
// Bounded to two entries per worker. Cloudflare's upstream cache is the
// cross-worker layer; this also coalesces misses and protects local Express.
const previews = new Map();

function jsonError(error, status, headers = {}) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  });
}

export async function onRequestGet({ request, env }) {
  const params = new URL(request.url).searchParams;
  const expected = {
    lat: String(MAP.lat), lng: String(MAP.lng), zoom: String(MAP.zoom),
    width: '640', height: '320',
  };
  // Missing optional settings retain the existing defaults; coordinates are
  // required. Reject duplicates and noncanonical values rather than parsing
  // partial numbers. Unknown parameters are ignored, never sent to Google.
  for (const [name, value] of Object.entries(expected)) {
    const values = params.getAll(name);
    if (values.length > 1 || (values.length === 1 && values[0] !== value)
        || (values.length === 0 && (name === 'lat' || name === 'lng'))) {
      return jsonError('Only the lodge map preview is supported', 400);
    }
  }
  const scales = params.getAll('scale');
  const scale = scales[0] ?? '1';
  if (scales.length > 1 || !['1', '2'].includes(scale)) {
    return jsonError('Unsupported map scale', 400);
  }
  const apiKey = env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return jsonError('Map service not configured', 503);
  }

  let entry = previews.get(scale);
  if (!entry || entry.expiresAt <= Date.now()) {
    entry = { expiresAt: Infinity };
    previews.set(scale, entry);
    entry.result = (async () => {
      try {
        const { lat, lng, zoom } = MAP;
        const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=640x320&scale=${scale}&maptype=roadmap&markers=color:0x0EA5E9%7C${lat},${lng}&key=${encodeURIComponent(apiKey)}`;
        const upstream = await fetch(staticMapUrl, {
          cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true },
          signal: AbortSignal.timeout(10000),
        });
        if (!upstream.ok || !upstream.headers.get('Content-Type')?.startsWith('image/png')) {
          throw new Error('Invalid map response');
        }
        const image = await upstream.arrayBuffer();
        entry.expiresAt = Date.now() + CACHE_SECONDS * 1000;
        return image;
      } catch {
        // Do not log upstream URLs/errors: they can contain the private key.
        entry.expiresAt = Date.now() + RETRY_SECONDS * 1000;
        return null;
      }
    })();
  }

  const image = await entry.result;
  if (image === null) {
    return jsonError('Map service temporarily unavailable', 503, {
      'Retry-After': String(Math.max(1, Math.ceil((entry.expiresAt - Date.now()) / 1000))),
    });
  }

  return new Response(image, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': `public, max-age=${Math.max(0, Math.floor((entry.expiresAt - Date.now()) / 1000))}`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
