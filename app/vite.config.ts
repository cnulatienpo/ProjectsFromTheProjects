import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

const proxyTargets = ['/sigil', '/goodword', '/cut', '/health', '/__diag', '/api', '/style-report', '/catalog']

const proxyConfig = process.env.VITE_DEV_API
  ? Object.fromEntries(
      proxyTargets.map((prefix) => [
        prefix,
        {
          target: process.env.VITE_DEV_API,
          changeOrigin: true,
        },
      ]),
    )
  : undefined

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
