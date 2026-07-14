/**
 * Cloudflare Pages Function — POST /api/booking/nearest-available
 *
 * Proxies a nearest-available-date search to the automailer, which fans out
 * parallel Beds24 calls to find the earliest bookable window for a specific
 * room that is sold-out for the guest's originally requested dates.
 *
 * Required Cloudflare Pages environment variables:
 *   AUTOMAILER_URL — Render service URL, e.g. "https://your-app.onrender.com"
 *   ADMIN_API_KEY  — Same key used by the automailer's requireAdminKey middleware
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
    const upstream = await fetch(`${automailerUrl}/api/booking/nearest-available`, {
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
    return json({ error: 'Could not search for availability. Please try again.' }, 502);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
