// Preloads the JS chunk(s) needed by a specific lazy-loaded route as soon as
// possible, without waiting for the main entry bundle to execute and mount
// React before the Suspense boundary triggers the dynamic import().
//
// Why this exists: /book-direct's hero <img> is BookDirectPage's actual LCP
// element (unlike the homepage, whose full-viewport hero <img> is excluded
// from LCP by Chrome's heuristic). BookDirectPage is React.lazy()-loaded, so
// its chunk isn't part of the entry's static import graph and Vite's default
// modulepreload injection (which only covers the entry graph) never targets
// it. Without this plugin, the BookDirectPage chunk only starts downloading
// after the entry bundle has fully parsed and executed and React has
// rendered the Suspense fallback — a fully serial network+compute waterfall.
//
// This plugin injects a small inline script into <head> that, ONLY when the
// current path is a matching route, appends <link rel="modulepreload"> tags
// for that route's chunk (and any of its static imports not already covered
// by the entry's own modulepreload links) — letting the browser fetch it in
// parallel with the entry bundle instead of waiting for it.
export default function preloadRouteChunks(routes) {
  return {
    name: 'preload-route-chunks',
    transformIndexHtml(html, ctx) {
      // Only run during build (not dev) — ctx.bundle is only present then.
      if (!ctx.bundle) return html;

      const scripts = [];

      for (const { path, chunkName } of routes) {
        const targetChunk = Object.values(ctx.bundle).find(
          (chunk) => chunk.type === 'chunk' && chunk.name === chunkName
        );
        if (!targetChunk) continue;

        // Preload the chunk itself plus any of its own static imports that
        // aren't already modulepreloaded for every page via the entry graph
        // (e.g. react-vendor/framer/icons are already covered because eager
        // homepage components import them too; route-only deps like the
        // booking i18n strings module are not).
        const candidateFiles = [targetChunk.fileName, ...(targetChunk.imports || [])];
        const uniqueFiles = candidateFiles.filter((f, i, arr) => arr.indexOf(f) === i);
        const filesToPreload = uniqueFiles.filter((f) => !html.includes(f));

        if (!filesToPreload.length) continue;

        const hrefsJson = JSON.stringify(filesToPreload.map((f) => `/${f}`));
        scripts.push(
          `(function(){if(location.pathname===${JSON.stringify(path)}){` +
            `${hrefsJson}.forEach(function(h){` +
            `var l=document.createElement('link');l.rel='modulepreload';l.crossOrigin='';l.href=h;` +
            `document.head.appendChild(l);` +
            `});}})();`
        );
      }

      if (!scripts.length) return html;

      const script = `  <script>${scripts.join('')}</script>\n`;
      const insertPoint = '<!-- Modulepreload main JS entry - flattens critical request chain -->';
      return html.replace(insertPoint, insertPoint + '\n' + script);
    },
  };
}
