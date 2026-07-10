/**
 * Cloudflare Pages Function — GET /api/gift-voucher/confirm?session_id=...
 * Fetches confirmed gift voucher details after a successful Stripe Checkout.
 * Required CF env vars: AUTOMAILER_URL, ADMIN_API_KEY
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const automailerUrl = env.AUTOMAILER_URL;
  const adminKey = env.ADMIN_API_KEY;

  if (!automailerUrl || !adminKey) {
    return json({ error: 'Service unavailable.' }, 503);
  }

  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');
  if (!sessionId) {
    return json({ error: 'Missing session_id' }, 400);
  }

  try {
    const upstream = await fetch(
      `${automailerUrl}/api/gift-voucher/confirm/${encodeURIComponent(sessionId)}`,
      {
        headers: { 'x-admin-key': adminKey },
      },
    );
    const data = await upstream.text();
    return new Response(data || '{}', {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return json({ error: 'Could not fetch confirmation. Please try again.' }, 502);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
