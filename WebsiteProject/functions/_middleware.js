/**
 * Cloudflare Pages Functions Middleware
 * 
 * Handles:
 * 1. Subdomain redirect (book.devoceanlodge.com → devoceanlodge.com/booking.html)
 * 2. Domain redirect (.pages.dev → devoceanlodge.com)
 * 3. SPA routing (404 HTML requests → index.html)
 * 4. Country code injection (IP geolocation for currency)
 */

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // 1. Redirect book.devoceanlodge.com subdomain to booking page
  if (url.hostname === 'book.devoceanlodge.com') {
    const redirectUrl = 'https://devoceanlodge.com/booking.html' + url.search;
    
    return new Response(null, {
      status: 301,
      headers: {
        'Location': redirectUrl
      }
    });
  }
  
  // 2. Redirect all .pages.dev traffic to main domain
  if (url.hostname.endsWith('.pages.dev')) {
    const mainDomain = 'https://devoceanlodge.com';
    const redirectUrl = mainDomain + url.pathname + url.search;
    
    return new Response(null, {
      status: 301,
      headers: {
        'Location': redirectUrl
      }
    });
  }
  
  // Get Cloudflare's IP-based country code
  const countryCode = request.cf?.country || null;
  
  // Get the response first
  const response = await context.next();
  
  // 2. SPA ROUTING: Handle 404s for HTML navigation (e.g., /experiences/dolphins)
  if (response.status === 404) {
    const accept = request.headers.get('Accept') || '';
    const path = url.pathname;
    
    // Check if this is an HTML navigation request (browser navigation)
    const isHtmlRequest = accept.includes('text/html');
    
    // Check if this is a file request (has file extension)
    const hasFileExtension = /\.[a-z0-9]+$/i.test(path);
    
    // Check if this is an API request
    const isApiRequest = path.startsWith('/api/');
    
    // SPA routes: HTML navigation WITHOUT file extension
    if (isHtmlRequest && !hasFileExtension && !isApiRequest) {
      // Fetch index.html for SPA routing
      const indexResponse = await context.env.ASSETS.fetch(new URL('/index.html', request.url));
      let html = await indexResponse.text();
      
      // Inject country code
      const injection = `<script>window.__CF_COUNTRY__="${countryCode || ''}";</script>`;
      html = html.replace('<head>', `<head>${injection}`);
      
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      });
    }
    
    // Everything else (files, API) - return original 404
    return response;
  }
  
  // 3. COUNTRY CODE INJECTION: For successful HTML responses
  if (response.headers.get('content-type')?.includes('text/html')) {
    let html = await response.text();
    
    // Inject country code as a global variable (before any scripts run)
    const injection = `<script>window.__CF_COUNTRY__="${countryCode || ''}";</script>`;
    html = html.replace('<head>', `<head>${injection}`);
    
    // Clone headers and remove Content-Length (body size changed)
    const headers = new Headers(response.headers);
    headers.delete('content-length');
    
    return new Response(html, {
      status: response.status,
      headers: headers
    });
  }
  
  // Return original response for non-HTML
  return response;
}
