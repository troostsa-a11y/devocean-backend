import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import asyncCSS from './vite-plugin-async-css.js';
import preloadEntry from './vite-plugin-preload-entry.js';

// Mobile-first config: 90% mobile traffic requires instant mobile LCP
export default defineConfig({
  plugins: [
    react(),
    asyncCSS(), // Make CSS async to eliminate 160ms mobile blocking
    preloadEntry(), // Inject modulepreload for main entry to eliminate waterfall
  ],
  
  build: {
    minify: 'esbuild',
    sourcemap: true,
    cssCodeSplit: false, // Single CSS bundle - better for mobile
    cssMinify: true,
    modulePreload: true, // Add modulepreload for main entry (reduces critical path latency)
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
