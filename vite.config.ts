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
        '/sigil': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
          secure: false,
        },
        '/health': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
          secure: false,
        },
        '/_debug': {
          target: process.env.VITE_DEV_API || 'http://127.0.0.1:3001',
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
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      proxy: {
        '/sigil':  { target: 'http://127.0.0.1:3001', changeOrigin: true, secure: false },
        '/health': { target: 'http://127.0.0.1:3001', changeOrigin: true, secure: false },
      },
      // DEV ONLY: allow inline + eval so React preamble and HMR work
      headers: isDev ? {
        'Content-Security-Policy': [
          "default-src 'self' blob: data:",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data:",
          "style-src 'self' 'unsafe-inline' blob: data:",
          "img-src 'self' data: blob:",
          "connect-src * ws: wss:",
          "font-src 'self' data:",
          "frame-ancestors *"
        ].join('; ')
      } : {}
    },
    build: { sourcemap: true },
    // Prod preview (no eval/inline)
    preview: {
      headers: {
        'Content-Security-Policy': [
          "default-src 'self' blob: data:",
          "script-src 'self' blob: data:",
          "style-src 'self' 'unsafe-inline' blob: data:",
          "img-src 'self' data: blob:",
          "connect-src 'self'",
          "font-src 'self' data:",
          "frame-ancestors 'self'"
        ].join('; ')
      }
    }
  };
});
