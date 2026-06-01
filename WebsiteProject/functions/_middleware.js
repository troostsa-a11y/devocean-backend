/**
 * Cloudflare Pages Functions Middleware
 * Injects window.__CF_COUNTRY__ into HTML responses for currency detection.
 */

export async function onRequest(context) {
  try {
    const response = await context.next();
    const contentType = response.headers.get('content-type') || '';

    if (!contentType.includes('text/html')) {
      return response;
    }

    const countryCode = context.request?.cf?.country || '';
    let html;
    try {
      html = await response.text();
    } catch {
      return response;
    }

    const injection = `<script>window.__CF_COUNTRY__="${countryCode}";</script>`;
    html = html.replace('<head>', `<head>${injection}`);

    const headers = new Headers(response.headers);
    headers.delete('content-length');
    return new Response(html, { status: response.status, headers });

  } catch (err) {
    console.error('[middleware]', err);
    try { return await context.next(); } catch { /* */ }
    return new Response('Internal Server Error', { status: 500 });
  }
}
