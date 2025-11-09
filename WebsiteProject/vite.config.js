import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import asyncCSS from './vite-plugin-async-css.js';

// Mobile-first config: 90% mobile traffic requires instant mobile LCP
export default defineConfig({
  plugins: [
    react(),
    asyncCSS(), // Make CSS async to eliminate 160ms mobile blocking
  ],
  
  build: {
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: false, // Single CSS bundle - better for mobile
    cssMinify: true,
    modulePreload: true, // Add modulepreload for main entry (reduces critical path latency)
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        }
      }
    }
  },
  
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: false,
  },
});
