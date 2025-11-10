/**
 * Experience Inquiry Cloudflare Function
 * Forwards requests to Express SMTP backend
 */

export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await context.request.json();
    
    // Forward to Express server (SMTP backend)
    // In production, use EMAIL_API_URL environment variable
    // In development, defaults to localhost:3003
    const apiUrl = context.env.EMAIL_API_URL || 'http://localhost:3003';
    
    const response = await fetch(`${apiUrl}/api/experience-inquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    
    return new Response(JSON.stringify(result), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Experience inquiry error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
