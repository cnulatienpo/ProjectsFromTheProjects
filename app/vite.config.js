import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// EDIT THIS: your repo name exactly (e.g. "projects-from-the-projects")
const REPO = process.env.GHPAGES_REPO || 'projects-from-the-projects'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  base: process.env.GHPAGES_BASE || `/${REPO}/`,
  server: {
    proxy: {
      '/catalog': { target: process.env.VITE_SERVER_ORIGIN || 'http://localhost:8787', changeOrigin: true },
      '/lessons': { target: process.env.VITE_SERVER_ORIGIN || 'http://localhost:8787', changeOrigin: true },
      '/bundle': { target: process.env.VITE_SERVER_ORIGIN || 'http://localhost:8787', changeOrigin: true },
      '/status': { target: process.env.VITE_SERVER_ORIGIN || 'http://localhost:8787', changeOrigin: true },
      '/sign': { target: process.env.VITE_SERVER_ORIGIN || 'http://localhost:8787', changeOrigin: true },
      '/sign-get': { target: process.env.VITE_SERVER_ORIGIN || 'http://localhost:8787', changeOrigin: true }
    }
  }
})
