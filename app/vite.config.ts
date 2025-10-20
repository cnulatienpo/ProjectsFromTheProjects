
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

const baseProxyTarget = 'http://127.0.0.1:3002'
// Only proxy API endpoints (catalog + lesson) to the backend.
// Do NOT proxy the entire /sigil prefix — that prevents client-side routes
// like /sigil/:id from rendering the SPA when reloading or directly visiting.
const defaultProxy = {
  '/sigil/catalog': { target: baseProxyTarget, changeOrigin: true, secure: false, timeout: 10000 },
  '/sigil/lesson': { target: baseProxyTarget, changeOrigin: true, secure: false, timeout: 10000 },
  '/attempt': { target: baseProxyTarget, changeOrigin: true, secure: false, timeout: 10000 },
  '/progress': { target: baseProxyTarget, changeOrigin: true, secure: false, timeout: 10000 },
  '/health': { target: baseProxyTarget, changeOrigin: true, secure: false, timeout: 10000 },
} as const

const extraProxyTargets = ['/goodword', '/cut', '/__diag', '/api', '/style-report', '/catalog', '/attempt', '/progress'] as const

const proxyConfig = (() => {
  const target = process.env.VITE_DEV_API?.trim()
  if (!target) return { ...defaultProxy }

  const entries = extraProxyTargets.map((prefix) => [
    prefix,
    {
      target,
      changeOrigin: true,
    },
  ])

  return {
    ...defaultProxy,
    ...Object.fromEntries(entries),
  }
})()

export default defineConfig({
  base: process.env.VITE_PAGES_BASE || '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@sigil': path.resolve(__dirname, 'src/sigil-syntax'),
    },
  },
  server: {
    headers: {
      // DEV ONLY: allow HMR/react-refresh to eval while debugging in the browser.
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' ws: wss: http: https:; worker-src 'self' blob:; frame-ancestors 'self';",
    },
    proxy: proxyConfig,
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
})
