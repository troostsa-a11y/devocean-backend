// Simple Vite plugin to make CSS load asynchronously (eliminates render-blocking on mobile)
export default function asyncCSS() {
  return {
    name: 'async-css',
    enforce: 'post',
    transformIndexHtml(html) {
      // Only in production builds
      if (process.env.NODE_ENV !== 'production') {
        return html;
      }

      // Find CSS link tags and make them async using media="print" trick
      // This prevents 160ms CSS blocking on mobile 4G networks
      // Match any <link rel="stylesheet"> regardless of attribute order
      return html.replace(
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
    }
  };
}
