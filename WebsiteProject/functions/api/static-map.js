/**
 * Cloudflare Pages Function — GET /api/static-map?lat=..&lng=..&zoom=..&width=..&height=..
 *
 * Proxies the Google Static Maps API so the API key stays server-side (never
 * exposed to the browser). Used by LocationSection.jsx to render a map
 * preview image before the visitor opts into the full interactive embed.
 *
 * Required Cloudflare Environment Variable:
 * - GOOGLE_MAPS_API_KEY
 *
 * Previously this endpoint lived on a standalone Express service
 * (devocean-api.onrender.com) that was never actually deployed as a Render
 * service — only "Automailer" and "Receptionist" exist there — so every
 * request failed and the frontend always fell back to its placeholder.
 * Moving it here (same origin as the site, alongside contact.js / fx.js)
 * means it just works once deployed, no separate service to stand up.
 */
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const lat = url.searchParams.get('lat');
  const lng = url.searchParams.get('lng');
  const zoom = url.searchParams.get('zoom') || '13';

  let width = parseInt(url.searchParams.get('width'), 10);
  let height = parseInt(url.searchParams.get('height'), 10);
  if (!Number.isFinite(width) || width <= 0) width = 896;
  if (!Number.isFinite(height) || height <= 0) height = 320;
  width = Math.min(width, 1280);
  height = Math.min(height, 1280);

  if (!lat || !lng) {
    return new Response(JSON.stringify({ error: 'Missing lat/lng parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_MAPS_API_KEY not configured');
    return new Response(JSON.stringify({ error: 'Map service not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&scale=2&maptype=roadmap&markers=color:0x0EA5E9%7C${lat},${lng}&key=${apiKey}`;

  try {
    const upstream = await fetch(staticMapUrl, {
      cf: { cacheTtl: 86400, cacheEverything: true },
    });

    if (!upstream.ok) {
      throw new Error(`Google Maps API error: ${upstream.status}`);
    }

    const imageBuffer = await upstream.arrayBuffer();

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Static map error:', error.message);
    return new Response(JSON.stringify({ error: 'Failed to generate map' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
