// Vite plugin for mobile performance optimization
// 1. Makes CSS load asynchronously (eliminates 160ms render-blocking)
// 2. Adds modulepreload for main JS bundle (parallel download)
export default function asyncCSS() {
  return {
    name: 'async-css',
    enforce: 'post',
    transformIndexHtml(html) {
      // Only in production builds
      if (process.env.NODE_ENV !== 'production') {
        return html;
      }

      let transformed = html;

      // Step 1: Make CSS async using media="print" trick
      transformed = transformed.replace(
        /<link\s+([^>]*rel="stylesheet"[^>]*)>/g,
        (match, attrs) => {
          // Extract href from attributes
          const hrefMatch = attrs.match(/href="([^"]+)"/);
          if (!hrefMatch || !hrefMatch[1].endsWith('.css')) {
            return match; // Skip non-CSS links
          }
          
          const cssPath = hrefMatch[1];
          // Preserve crossorigin if present
          const hasCrossorigin = attrs.includes('crossorigin');
          const crossoriginAttr = hasCrossorigin ? ' crossorigin' : '';
          
          return `<link rel="stylesheet" href="${cssPath}"${crossoriginAttr} media="print" onload="this.media='all';this.onload=null">
<noscript><link rel="stylesheet" href="${cssPath}"${crossoriginAttr}></noscript>`;
        }
      );

      // Step 2: Add modulepreload for main JS bundle (reduces critical path latency)
      // Find the main script tag and add a modulepreload hint before it
      transformed = transformed.replace(
        /<script\s+type="module"\s+crossorigin\s+src="([^"]+\/index-[^"]+\.js)">/,
        (match, jsPath) => {
          return `<link rel="modulepreload" href="${jsPath}" crossorigin>
${match}`;
        }
      );

      return transformed;
    }
  };
}
