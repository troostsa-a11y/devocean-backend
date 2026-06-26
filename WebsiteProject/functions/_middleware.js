/**
 * Cloudflare Pages Functions Middleware
 *
 * 1. Injects window.__CF_COUNTRY__ into HTML responses so the React app can
 *    default to the visitor's local currency without an extra API round-trip.
 *
 * 2. SPA fallback: when context.next() finds no static asset (404) and the
 *    browser is requesting HTML, serve index.html so React's router can handle
 *    the path (e.g. /admin, /why-ponta, /experiences/:key).
 *    We cannot rely on _redirects for this because the root middleware
 *    intercepts every request before _redirects is consulted.
 */

export async function onRequest(context) {
  try {
    // Legacy iframe booking pages → native direct-booking flow.
    // Must run before context.next(): the deleted /book/*.html paths would
    // otherwise 404 and fall through to the SPA index.html fallback below
    // instead of redirecting (the root middleware intercepts before _redirects).
    const { pathname } = new URL(context.request.url);
    if (pathname.startsWith('/book/')) {
      return Response.redirect(new URL('/book-direct', context.request.url).href, 301);
    }

    let response = await context.next();

    // SPA fallback: no static file matched → serve index.html for React routing
    if (response.status === 404) {
      const accept = context.request.headers.get('accept') || '';
      if (accept.includes('text/html')) {
        const indexUrl = new URL('/index.html', context.request.url);
        response = await fetch(indexUrl.href);
      } else {
        // Asset/API 404 — pass through as-is
        return response;
      }
    }

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
    // Do NOT call context.next() again — it has already been called and
    // the asset binding cannot handle non-GET methods, which causes 1101.
    return new Response('Service Error', { status: 500 });
  }
}
