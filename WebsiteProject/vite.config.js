import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// MINIMAL CONFIG - Testing if custom plugins break production
export default defineConfig({
  plugins: [react()],
  
  build: {
    minify: 'esbuild',
    sourcemap: false,
  },
  
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: false,
  },
});
