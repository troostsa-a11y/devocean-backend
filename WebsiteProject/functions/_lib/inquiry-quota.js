/**
 * Reserve one send pair in the existing automailer database. Both forms share
 * the same quota service; edge-local counters would be bypassable across POPs.
 * Never send if the quota service/configuration is unavailable.
 */
export async function reserveInquirySend({ request, env, email, operatorEmail, corsHeaders }) {
  const headers = {
    ...corsHeaders,
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };
  const unavailable = () => new Response(JSON.stringify({
    error: 'Inquiries are temporarily unavailable. Please try again later.',
  }), { status: 503, headers: { ...headers, 'Retry-After': '60' } });

  if (!env.AUTOMAILER_URL || !env.ADMIN_API_KEY) return unavailable();
  try {
    const response = await fetch(`${env.AUTOMAILER_URL}/api/inquiry/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': env.ADMIN_API_KEY },
      body: JSON.stringify({
        // Only Cloudflare's trusted header; never caller-provided forwarding headers.
        ip: request.headers.get('CF-Connecting-IP') || 'unknown',
        email: email.trim().toLowerCase(),
        operatorEmail,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (response.status === 429) {
      const seconds = Number(response.headers.get('Retry-After'));
      return new Response(JSON.stringify({
        error: 'Too many inquiries. Please try again later.',
      }), {
        status: 429,
        headers: { ...headers, 'Retry-After': String(Number.isInteger(seconds) && seconds > 0 ? seconds : 3600) },
      });
    }
    if (response.status !== 200 || (await response.json()).allowed !== true) return unavailable();
    return null;
  } catch {
    return unavailable();
  }
}
