import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// MINIMAL CONFIG - Testing if custom plugins break production
export default defineConfig({
  plugins: [react()],
  
  build: {
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true, // Split CSS per route to reduce initial bundle
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor CSS
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
