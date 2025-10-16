import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  base: process.env.VITE_PAGES_BASE || '/',
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: {
    proxy: {
      '/sigil': {
        target: process.env.VITE_DEV_API || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: { sourcemap: true },
});
