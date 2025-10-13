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
  
  // Otherwise, continue to next middleware/function
  return context.next();
}
