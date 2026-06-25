/**
 * Cloudflare Pages Function — POST /api/booking/checkout
 *
 * Proxies a checkout request to the automailer, which re-prices the stay from a
 * fresh Beds24 quote, creates a pending direct_booking row and a Stripe Checkout
 * session, then returns the hosted checkout URL. The admin key never leaves the
 * server side.
 *
 * Required Cloudflare Pages environment variables:
 *   AUTOMAILER_URL — Render service URL
 *   ADMIN_API_KEY  — Shared admin key
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  const automailerUrl = env.AUTOMAILER_URL;
  const adminKey = env.ADMIN_API_KEY;

  if (!automailerUrl || !adminKey) {
    return json({ error: 'Booking is not available right now.' }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  try {
    const upstream = await fetch(`${automailerUrl}/api/booking/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
        'cf-ipcountry': request.headers.get('cf-ipcountry') || '',
      },
      body: JSON.stringify(body),
    });
    const data = await upstream.text();
    return new Response(data || '{}', {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return json({ error: 'Could not start checkout. Please try again.' }, 502);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
