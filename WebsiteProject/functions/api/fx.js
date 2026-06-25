/**
 * Cloudflare Pages Function — GET /api/fx?base=USD
 *
 * Returns display-only foreign-exchange rates for the /book-direct page so the
 * availability prices can show an approximate value in the visitor's local
 * currency alongside the real (charged) amount.
 *
 * These rates NEVER affect what Stripe charges — bookings are always priced and
 * charged in the Beds24 property currency (the `base`). This endpoint is purely
 * informational.
 *
 * Source: open.er-api.com (free, no API key, CORS-enabled). Edge-cached ~6h.
 */
export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  let base = (url.searchParams.get('base') || 'USD').toUpperCase();
  if (!/^[A-Z]{3}$/.test(base)) base = 'USD';

  try {
    const upstream = await fetch(`https://open.er-api.com/v6/latest/${base}`, {
      cf: { cacheTtl: 21600, cacheEverything: true },
    });
    const data = await upstream.json();
    const rates = data && data.result === 'success' && data.rates ? data.rates : {};
    const ok = Object.keys(rates).length > 0;
    return jsonResponse({ base, rates }, ok ? 21600 : 300);
  } catch {
    return jsonResponse({ base, rates: {} }, 300);
  }
}

function jsonResponse(obj, maxAge) {
  return new Response(JSON.stringify(obj), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${maxAge}`,
    },
  });
}
