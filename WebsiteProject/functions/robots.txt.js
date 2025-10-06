// Cloudflare Pages Function to serve robots.txt as plain text
// This bypasses SPA routing

import { readFileSync } from 'fs';
import { join } from 'path';

export async function onRequest() {
  // Read the robots.txt file from the public directory
  const robotsContent = `User-agent: *
Allow: /

Sitemap: https://devoceanlodge.com/sitemap.xml`;

  return new Response(robotsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}
