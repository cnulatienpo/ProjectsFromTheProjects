import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const REPO = process.env.GHPAGES_REPO || 'projects-from-the-projects'
const BACKEND = process.env.VITE_DEV_API || 'http://localhost:3001'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@sigil': path.resolve(__dirname, 'src/sigil-syntax'),
    }
  },
  base: process.env.GHPAGES_BASE || `/${REPO}/`,
  server: {
    proxy: {
      '/sigil': { target: BACKEND, changeOrigin: true, secure: false },
      '/goodword': { target: BACKEND, changeOrigin: true, secure: false },
      '/api': { target: BACKEND, changeOrigin: true, secure: false },
      '/report-types': { target: BACKEND, changeOrigin: true, secure: false },
      '/writer-types': { target: BACKEND, changeOrigin: true, secure: false },
      '/health': { target: BACKEND, changeOrigin: true, secure: false },
      '/status': { target: BACKEND, changeOrigin: true, secure: false },
      '/_debug': { target: BACKEND, changeOrigin: true, secure: false },
    }
  }
})
