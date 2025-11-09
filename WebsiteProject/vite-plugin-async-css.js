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

      // Find the main CSS link tag and make it async using media="print" trick
      // This prevents 160ms CSS blocking on mobile 4G networks
      return html.replace(
        /<link rel="stylesheet" crossorigin href="([^"]+\.css)">/g,
        (match, cssPath) => {
          return `<link rel="stylesheet" href="${cssPath}" media="print" onload="this.media='all';this.onload=null">
<noscript><link rel="stylesheet" href="${cssPath}"></noscript>`;
        }
      );
    }
  };
}
