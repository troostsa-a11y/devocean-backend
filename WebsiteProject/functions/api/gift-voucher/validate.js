/**
 * Cloudflare Pages Function — GET /api/gift-voucher/validate?code=...
 * Validates a gift voucher code and returns its remaining balance.
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
  const code = url.searchParams.get('code');
  if (!code) {
    return json({ error: 'Missing code' }, 400);
  }

  try {
    const upstream = await fetch(
      `${automailerUrl}/api/gift-voucher/validate?code=${encodeURIComponent(code)}`,
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
    return json({ error: 'Could not validate voucher. Please try again.' }, 502);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
