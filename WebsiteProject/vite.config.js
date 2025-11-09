import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import critical from 'rollup-plugin-critical';

// Mobile-first config: 90% mobile traffic requires instant mobile LCP
export default defineConfig({
  plugins: [
    react(),
    // Critical CSS inlining for mobile performance
    // Eliminates 160ms CSS blocking on mobile 4G networks
    critical({
      inline: true,
      minify: true,
      dimensions: [
        {
          height: 844,
          width: 390,
        }, // iPhone 14/15 Pro (most common mobile)
        {
          height: 915,
          width: 412,
        }, // Android mid-range
      ],
      target: {
        html: 'dist/index.html',
      },
      extract: true, // Extract critical CSS and inline it
      base: 'dist/',
    }),
  ],
  
  build: {
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: false, // Single CSS bundle - better for mobile
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
