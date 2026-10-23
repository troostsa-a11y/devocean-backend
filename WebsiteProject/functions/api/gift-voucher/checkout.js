/**
 * Cloudflare Pages Function — POST /api/gift-voucher/checkout
 * Proxies gift-voucher Stripe Checkout creation to the automailer.
 * Required CF env vars: AUTOMAILER_URL, ADMIN_API_KEY
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  const automailerUrl = env.AUTOMAILER_URL;
  const adminKey = env.ADMIN_API_KEY;

  if (!automailerUrl || !adminKey) {
    return json({ error: 'Gift vouchers are not available right now.' }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  try {
    const upstream = await fetch(`${automailerUrl}/api/gift-voucher/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
        // CF supplies this header. Never forward a caller's x-voucher-client-ip
        // or X-Forwarded-For; the backend trusts this only after admin-key auth.
        'x-voucher-client-ip': request.headers.get('CF-Connecting-IP') || 'unknown',
      },
      body: JSON.stringify(body),
    });
    const data = await upstream.text();
    return new Response(data || '{}', {
      status: upstream.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        ...(upstream.headers.has('Retry-After')
          ? { 'Retry-After': upstream.headers.get('Retry-After') } : {}),
      },
    });
  } catch {
    return json({ error: 'Could not start checkout. Please try again.' }, 502);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
