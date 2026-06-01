/**
 * Cloudflare Pages Functions Middleware
 *
 * Handles:
 * 1. Subdomain redirect (book.devoceanlodge.com → devoceanlodge.com/book/EN.html)
 * 2. SPA routing (404 HTML requests → index.html)
 * 3. Country code injection (IP geolocation for currency)
 *
 * Note: .pages.dev preview redirects were removed — they prevented testing
 * deployments on the Cloudflare preview URL before going to production.
 */

export async function onRequest(context) {
  try {
    const { request } = context;
    const url = new URL(request.url);

    // 1. Redirect book.devoceanlodge.com subdomain to English booking page
    if (url.hostname === 'book.devoceanlodge.com') {
      return new Response(null, {
        status: 301,
        headers: { 'Location': 'https://devoceanlodge.com/book/EN.html' + url.search }
      });
    }

    // Get Cloudflare's IP-based country code (safe — undefined if not available)
    const countryCode = request.cf?.country || '';

    // Pass request to next handler (static asset or API Function)
    const response = await context.next();

    // 2. SPA ROUTING: serve index.html for HTML navigation that returned 404
    if (response.status === 404) {
      const accept = request.headers.get('Accept') || '';
      const path = url.pathname;
      const isHtmlRequest = accept.includes('text/html');
      const hasFileExtension = /\.[a-z0-9]+$/i.test(path);
      const isApiRequest = path.startsWith('/api/');

      if (isHtmlRequest && !hasFileExtension && !isApiRequest) {
        // Guard: ASSETS binding is automatically available in Pages Functions,
        // but check to avoid a TypeError if somehow not bound.
        if (!context.env?.ASSETS) {
          // Fallback: return the 404 as-is; SPA routing won't work but no 1101
          console.error('[middleware] context.env.ASSETS not available');
          return response;
        }
        try {
          const indexResponse = await context.env.ASSETS.fetch(
            new URL('/index.html', request.url)
          );
          let html = await indexResponse.text();
          const injection = `<script>window.__CF_COUNTRY__="${countryCode}";</script>`;
          html = html.replace('<head>', `<head>${injection}`);
          return new Response(html, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        } catch (assetErr) {
          console.error('[middleware] ASSETS.fetch failed:', assetErr);
          return response;
        }
      }

      // File, API, or non-HTML 404 — return as-is
      return response;
    }

    // 3. COUNTRY CODE INJECTION: inject into successful HTML responses
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      try {
        let html = await response.text();
        const injection = `<script>window.__CF_COUNTRY__="${countryCode}";</script>`;
        html = html.replace('<head>', `<head>${injection}`);
        const headers = new Headers(response.headers);
        headers.delete('content-length');
        return new Response(html, { status: response.status, headers });
      } catch (textErr) {
        // Body read failed — return original response untouched
        console.error('[middleware] response.text() failed:', textErr);
        return response;
      }
    }

    // Non-HTML response (JSON, assets, etc.) — pass through unchanged
    return response;

  } catch (err) {
    // Top-level safety net: log and pass through rather than throwing a 1101
    console.error('[middleware] Unhandled error:', err);
    try {
      return await context.next();
    } catch {
      return new Response('Internal Server Error', { status: 500 });
    }
  }
}
