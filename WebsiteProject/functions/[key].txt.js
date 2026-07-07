// Cloudflare Pages Function to serve IndexNow key file as plain text
// This bypasses SPA routing to ensure .txt files are served correctly

export async function onRequest(context) {
  const { params } = context;
  const key = params.key;
  
  // Only serve the IndexNow key file inline
  if (key === '4339cd9fe9f2766ae7f04b21f3848dec') {
    return new Response(key, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  }
  
  // For all other .txt requests (robots.txt, llms.txt, etc.) fall through
  // to the static file system so public/*.txt files are served correctly.
  return context.next();
}
