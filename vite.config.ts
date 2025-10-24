// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isDev = mode !== 'production';

  return {
    base: process.env.VITE_PAGES_BASE || '/',
    plugins: [react()],
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
    server: {
      proxy: {
        // To change backend port, set VITE_DEV_API before starting Vite:
        // VITE_DEV_API=http://127.0.0.1:3002 npm run dev
        '/sigil': {
          target: 'http://127.0.0.1:3002',
          changeOrigin: true,
          secure: false,
        },
      },
      headers: isDev
        ? {
          // DEV ONLY: allow Vite React preamble + HMR
          'Content-Security-Policy': [
            "default-src 'self' blob: data:",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data:",
            "style-src 'self' 'unsafe-inline' blob: data:",
            "img-src 'self' data: blob:",
            'connect-src * ws: wss:',
            "font-src 'self' data:",
            "frame-ancestors *",
          ].join('; '),
        }
        : {},
    },

