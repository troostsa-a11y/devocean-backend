/**
 * Cloudflare Pages Functions Middleware
 *
 * Injects window.__CF_COUNTRY__ into HTML responses so the React app can
 * default to the visitor's local currency without an extra API round-trip.
 *
 * SPA routing (404 → index.html) is handled by _redirects, so this
 * middleware only needs to do the country-code injection.
 */

export async function onRequest(context) {
  try {
    const response = await context.next();
    const contentType = response.headers.get('content-type') || '';

    if (!contentType.includes('text/html')) {
      return response;
    }

    const countryCode = context.request?.cf?.country || '';
    const html = await response.text();
    const injection = `<script>window.__CF_COUNTRY__="${countryCode}";</script>`;
    const modified = html.replace('<head>', `<head>${injection}`);

    const headers = new Headers(response.headers);
    headers.delete('content-length');
    return new Response(modified, { status: response.status, headers });

  } catch (err) {
    console.error('[middleware]', err);
    return context.next();
  }
}
