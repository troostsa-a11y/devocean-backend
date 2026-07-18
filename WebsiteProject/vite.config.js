import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import asyncCSS from './vite-plugin-async-css.js';
import preloadEntry from './vite-plugin-preload-entry.js';
import preloadRouteChunks from './vite-plugin-preload-route-chunks.js';
import { rmSync, existsSync } from 'fs';
import { resolve } from 'path';

// Single source of truth for the Mia voice-receptionist Render URL.
// Change this one constant if the service URL ever moves (custom subdomain, etc.).
// Used by injectMiaUrl() below to replace %%MIA_URL%% placeholders in index.html.
const MIA_URL = 'https://mia-voice-receptionist.onrender.com';

// Replace %%MIA_URL%% placeholders in index.html with the MIA_URL constant above.
// This runs in both dev (transformIndexHtml is called by the dev server) and build.
const injectMiaUrl = () => ({
  name: 'inject-mia-url',
  transformIndexHtml(html) {
    return html.replaceAll('%%MIA_URL%%', MIA_URL);
  }
});

// After the build, remove dist/functions/ if the build script copied it there.
// The build script runs `cp -r functions dist/` which causes Cloudflare Pages
// to use the raw unbundled source files as Workers instead of the compiled
// Functions bundle — every relative import then fails at runtime (Error 1101).
// Wrangler compiles functions/ from the project root automatically; dist/ must
// not contain a functions/ directory.
const cleanFunctionsFromDist = () => ({
  name: 'clean-functions-from-dist',
  closeBundle() {
    const target = resolve(__dirname, 'dist/functions');
    if (existsSync(target)) {
      rmSync(target, { recursive: true, force: true });
    }
  }
});

// After Vite finishes all HTML transforms, move the entry <script type="module">
// from <head> (where Vite hoists it) to the very bottom of <body>.
// This lets the browser paint the static #hero-placeholder before executing JS,
// while the <link rel="modulepreload"> hint added by preloadEntry() still ensures
// the entry bundle starts downloading immediately from the preload scanner.
const moveScriptToBody = () => ({
  name: 'move-script-to-body',
  enforce: 'post',
  transformIndexHtml: {
    order: 'post',
    handler(html) {
      // Match only Vite-built entry scripts (crossorigin + /assets/ path)
      const scriptRe = /<script type="module" crossorigin src="\/assets\/[^"]+"><\/script>/g;
      const scripts = html.match(scriptRe);
      if (!scripts) return html;
      // Remove from wherever Vite placed them, append before </body>
      let out = html;
      for (const s of scripts) out = out.replace(s, '');
      return out.replace('</body>', scripts.join('\n') + '\n</body>');
    }
  }
});

// Mobile-first config: 90% mobile traffic requires instant mobile LCP
export default defineConfig({
  plugins: [
    react(),
    injectMiaUrl(), // Replace %%MIA_URL%% in index.html with the MIA_URL constant
    asyncCSS(), // Make CSS async to eliminate 160ms mobile blocking
    preloadEntry(), // Inject modulepreload for main entry to eliminate waterfall
    preloadRouteChunks([
      { path: '/book-direct', chunkName: 'BookDirectPage' },
    ]), // Fetch lazy route chunks in parallel with the entry bundle instead of after it mounts
    moveScriptToBody(), // Keep entry script at bottom of body so static hero paints first
    cleanFunctionsFromDist(), // Remove dist/functions/ — wrangler bundles functions/ separately; raw sources in dist/ cause Error 1101
  ],
  
  build: {
    minify: 'esbuild',
    sourcemap: true,
    cssCodeSplit: false, // Single CSS bundle - better for mobile
    cssMinify: true,
    modulePreload: { polyfill: false }, // Keep <link rel="modulepreload"> hints for vendor chunks; skip polyfill script
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'framer': ['framer-motion'],
          'icons': ['lucide-react'],
          'i18n': ['i18next', 'react-i18next'],
        }
      }
    },
    chunkSizeWarningLimit: 800
  },
  
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: false,
  },
});
