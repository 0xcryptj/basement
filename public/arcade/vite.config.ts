import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: '../assets',
  server: {
    port: 5173,
    open: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@assets': resolve(__dirname, '../assets')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'arcade.html')
      }
    }
  },
  optimizeDeps: {
    include: ['three', 'gsap', 'ethers']
  }
});

