import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// MINIMAL CONFIG - Optimized for mobile performance
export default defineConfig({
  plugins: [react()],
  
  build: {
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: false, // Single CSS bundle - faster on slow mobile networks
    cssMinify: true,
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
