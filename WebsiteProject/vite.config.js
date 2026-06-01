import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import asyncCSS from './vite-plugin-async-css.js';
import preloadEntry from './vite-plugin-preload-entry.js';

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
    asyncCSS(), // Make CSS async to eliminate 160ms mobile blocking
    preloadEntry(), // Inject modulepreload for main entry to eliminate waterfall
    moveScriptToBody(), // Keep entry script at bottom of body so static hero paints first
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
          'icons': ['lucide-react', 'react-icons'],
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
