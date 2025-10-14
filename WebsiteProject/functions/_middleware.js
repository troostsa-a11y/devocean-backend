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
  
  // If this is an HTML request, inject the country code
  if (url.pathname === '/' || url.pathname.endsWith('.html')) {
    const response = await context.next();
    
    // Only inject for HTML responses
    if (response.headers.get('content-type')?.includes('text/html')) {
      let html = await response.text();
      
      // Inject country code as a global variable (before any scripts run)
      const injection = `<script>window.__CF_COUNTRY__="${countryCode || ''}";</script>`;
      html = html.replace('<head>', `<head>${injection}`);
      
      return new Response(html, {
        status: response.status,
        headers: response.headers
      });
    }
    
    return response;
  }
  
  // Otherwise, continue to next middleware/function
  return context.next();
}
