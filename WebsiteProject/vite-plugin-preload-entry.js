export default function preloadEntry() {
  return {
    name: 'preload-entry',
    transformIndexHtml(html, ctx) {
      // Only run during build (not dev)
      if (!ctx.bundle) return html;

      // Find the main entry JS file (index-*.js)
      const entryChunk = Object.values(ctx.bundle).find(
        chunk => chunk.type === 'chunk' && chunk.isEntry && chunk.name === 'index'
      );

      if (!entryChunk) return html;

      // Inject preload tag for main entry before other modulepreloads
      const preloadTag = `  <link rel="modulepreload" crossorigin href="/${entryChunk.fileName}">\n`;
      
      // Insert after the existing modulepreload comment in index.html
      const insertPoint = '<!-- Modulepreload main JS entry - flattens critical request chain -->';
      return html.replace(insertPoint, insertPoint + '\n' + preloadTag);
    }
  };
}
