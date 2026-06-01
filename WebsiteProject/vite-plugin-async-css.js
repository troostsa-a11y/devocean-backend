// Vite plugin: non-render-blocking CSS with high-priority preload
//
// Why both tags?
// - <link rel="preload" as="style"> tells the browser to fetch the CSS with
//   HIGH priority (same as a regular stylesheet) but WITHOUT blocking rendering.
//   This is critical for LCP: the browser downloads CSS fast so React gets
//   styles quickly after hydration, preventing a late styled-paint that Chrome
//   records as a new (later) LCP candidate.
// - <link rel="stylesheet" media="print"> is the non-render-blocking delivery
//   mechanism. The onload callback switches media back to "all" so styles apply
//   the moment the file finishes downloading.
//
// Without the preload: CSS downloads at low browser priority (print media),
// arrives late, React paints an unstyled hero section first, then CSS applies
// and triggers a large re-paint that Chrome measures as LCP (~11s on mobile).
// With the preload: CSS downloads urgently in parallel with the JS bundle,
// so it's usually ready by the time React first renders the hero section.
export default function asyncCSS() {
  return {
    name: 'async-css',
    enforce: 'post',
    transformIndexHtml(html) {
      // Only in production builds
      if (process.env.NODE_ENV !== 'production') {
        return html;
      }

      // Find CSS link tags and make them non-render-blocking but high-priority
      return html.replace(
        /<link\s+([^>]*rel="stylesheet"[^>]*)>/g,
        (match, attrs) => {
          const hrefMatch = attrs.match(/href="([^"]+)"/);
          if (!hrefMatch || !hrefMatch[1].endsWith('.css')) {
            return match;
          }

          const cssPath = hrefMatch[1];
          const hasCrossorigin = attrs.includes('crossorigin');
          const crossoriginAttr = hasCrossorigin ? ' crossorigin' : '';

          return `<link rel="preload" as="style" href="${cssPath}"${crossoriginAttr}>
<link rel="stylesheet" href="${cssPath}"${crossoriginAttr} media="print" onload="this.media='all';this.onload=null">
<noscript><link rel="stylesheet" href="${cssPath}"${crossoriginAttr}></noscript>`;
        }
      );
    }
  };
}
