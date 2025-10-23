// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const isDev = mode !== 'production';
  const apiPort = process.env.VITE_API_PORT || '3002'; // Default to 3002, override with env var
  const apiTarget = `http://127.0.0.1:${apiPort}`;

  return {
    base: process.env.VITE_PAGES_BASE || '/',
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(
          , 'src'),
      },
    },
    server: {
      proxy: {
        '/sigil': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/health': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/_debug': {
          target: process.env.VITE_DEV_API || apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
      headers: isDev
        ? {
            'Content-Security-Policy': [
              "default-src 'self' blob: data:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data:",
              "style-src 'self' 'unsafe-inline' blob: data:",
              "img-src 'self' data: blob:",
              "connect-src * ws: wss:",
              "font-src 'self' data:",
              "frame-ancestors *",
            ].join('; '),
          }
        : {},
    },
    preview: {
      headers: {
        'Content-Security-Policy': [
          "default-src 'self' blob: data:",
          "script-src 'self' blob: data:",
          "style-src 'self' 'unsafe-inline' blob: data:",
          "img-src 'self' data: blob:",
          "connect-src 'self'",
          "font-src 'self' data:",
          "frame-ancestors 'self'",
        ].join('; '),
      },
    },
    build: {
      sourcemap: true,
    },
  };
});
