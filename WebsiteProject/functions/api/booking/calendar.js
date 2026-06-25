/**
 * Cloudflare Pages Function — GET /api/booking/calendar?startDate&endDate
 *
 * Proxies a per-date price-calendar request to the automailer's native booking
 * API, attaching the shared admin key (held only on the server) and the
 * visitor's country (for parity with the rest of the pipeline). The automailer
 * derives the per-date prices live from Beds24; the browser only ever receives
 * the resulting price map (used to colour the date picker by rate tier).
 *
 * Required Cloudflare Pages environment variables:
 *   AUTOMAILER_URL — Render service URL, e.g. "https://your-app.onrender.com"
 *   ADMIN_API_KEY  — Same key used by the automailer's requireAdminKey middleware
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const automailerUrl = env.AUTOMAILER_URL;
  const adminKey = env.ADMIN_API_KEY;

  if (!automailerUrl || !adminKey) {
    return json({ error: 'Booking is not available right now.' }, 503);
  }

  const search = new URL(request.url).search; // includes leading "?" (or empty)

  try {
    const upstream = await fetch(`${automailerUrl}/api/booking/calendar${search}`, {
      method: 'GET',
      headers: {
        'x-admin-key': adminKey,
        'cf-ipcountry': request.headers.get('cf-ipcountry') || '',
      },
    });
    const data = await upstream.text();
    return new Response(data || '{}', {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return json({ error: 'Could not load the rate calendar.' }, 502);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
