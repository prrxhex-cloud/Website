import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// High-Performance & Low-Bandwidth Network Optimization Config
export default defineConfig({
  logLevel: 'error',
  base: './',
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Smart vendor chunk splitting for 100% cache reusability on 3G/4G/5G
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'vendor-motion': ['framer-motion'],
          'vendor-ui': ['lucide-react', 'sonner', 'canvas-confetti'],
        },
        // Content hashing for permanent immutable caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
});