import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  // For GitHub Pages deploys, keep this in sync with your repo name
  base: process.env.GHPAGES_BASE || '/projects-from-the-projects/',
  server: {
    // Option A: we call the backend directly via VITE_DEV_API; no proxy required
    strictPort: true,
    port: 5173
  },
  build: {
    sourcemap: true
  }
})
