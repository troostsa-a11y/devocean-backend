/**
 * Cloudflare Pages Function — POST /api/track-session
 *
 * Captures the visitor's GA4 client_id (extracted from the _ga cookie on the
 * frontend) the moment they click "Book Now" and forwards it to the automailer
 * Express API for PostgreSQL storage.  The automailer later uses this record
 * to attribute confirmed Beds24 bookings back to the original browser session
 * via GA4 Measurement Protocol.
 *
 * Required Cloudflare Pages environment variables:
 *   AUTOMAILER_URL   — Render service URL, e.g. "https://your-app.onrender.com"
 *   ADMIN_API_KEY    — Same key used by the automailer's requireAdminKey middleware
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  const automailerUrl = env.AUTOMAILER_URL;
  const adminKey      = env.ADMIN_API_KEY;

  if (!automailerUrl || !adminKey) {
    return new Response(JSON.stringify({ error: 'Automailer not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { cid, lang, currency } = body;
  if (!cid || typeof cid !== 'string' || cid.length > 64) {
    return new Response(JSON.stringify({ error: 'Missing or invalid cid' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const country = request.headers.get('cf-ipcountry') || null;

  try {
    const upstream = await fetch(`${automailerUrl}/api/track-session`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key':  adminKey,
      },
      body: JSON.stringify({ cid, lang, currency, country }),
    });

    const data = await upstream.json();
    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
