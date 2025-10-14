// Redirect all .pages.dev traffic to main domain
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // Check if hostname ends with .pages.dev
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
  
  // Only inject for HTML responses (handles SPA deep links)
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
