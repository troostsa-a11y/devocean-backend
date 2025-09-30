import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  build: {
    // Enable minification with esbuild (faster than terser)
    minify: 'esbuild',
    
    // Disable source maps for smaller production builds
    sourcemap: false,
    
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'motion';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('i18next')) {
              return 'i18n-vendor';
            }
            // All other vendors
            return 'vendor';
          }
          
          // App chunks - separate translations for lazy loading
          if (id.includes('/i18n/translations')) {
            return 'translations';
          }
        },
        
        // Naming pattern for chunks
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Organize assets by type
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 500, // Warn if chunk > 500KB
    
    // Enable CSS code splitting
    cssCodeSplit: true,
    
    // Target modern browsers for smaller bundles
    target: 'es2015',
    
    // Optimize tree shaking
    modulePreload: {
      polyfill: true,
    },
  },
  
  // Optimize dev server
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: false,
    allowedHosts: ['all'],
    hmr: {
      overlay: true,
    },
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
    exclude: [],
    esbuildOptions: {
      target: 'es2020',
    },
  },
});
