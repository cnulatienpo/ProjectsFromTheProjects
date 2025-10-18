import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

const baseProxyTarget = 'http://127.0.0.1:3001'
const defaultProxy = {
  '/sigil': { target: baseProxyTarget, changeOrigin: true, secure: false },
  '/health': { target: baseProxyTarget, changeOrigin: true, secure: false },
} as const

const extraProxyTargets = ['/goodword', '/cut', '/__diag', '/api', '/style-report', '/catalog'] as const

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
    proxy: proxyConfig,
  },
})
