/**
 * Cloudflare Pages Function — GET /api/booking/result/:ref
 *
 * Returns the status + summary of a direct booking (no secrets) for the
 * confirmation page to poll after Stripe redirects back. Proxies to the
 * automailer with the shared admin key.
 *
 * Required Cloudflare Pages environment variables:
 *   AUTOMAILER_URL — Render service URL
 *   ADMIN_API_KEY  — Shared admin key
 */

export async function onRequestGet(context) {
  const { params, env } = context;
  const automailerUrl = env.AUTOMAILER_URL;
  const adminKey = env.ADMIN_API_KEY;

  if (!automailerUrl || !adminKey) {
    return json({ error: 'Booking is not available right now.' }, 503);
  }

  const ref = params.ref;
  if (!ref || typeof ref !== 'string') {
    return json({ error: 'Missing booking reference' }, 400);
  }

  try {
    const upstream = await fetch(
      `${automailerUrl}/api/booking/result/${encodeURIComponent(ref)}`,
      {
        method: 'GET',
        headers: { 'x-admin-key': adminKey },
      },
    );
    const data = await upstream.text();
    return new Response(data || '{}', {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return json({ error: 'Could not load booking status.' }, 502);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
