import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const REPO = process.env.GHPAGES_REPO || 'projects-from-the-projects'
const BACKEND = process.env.VITE_DEV_API || 'http://localhost:3001' // or your Codespace port-forward URL

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@sigil': path.resolve(__dirname, 'src/sigil-syntax')
    }
  },
  base: process.env.GHPAGES_BASE || `/${REPO}/`,
  server: {
    proxy: {
      // gameplay + content endpoints
      '^/(sigil|goodword|catalog|bundle|report-types|writer-types|api)/.*': {
        target: BACKEND,
        changeOrigin: true,
        secure: false
      }
    }
  }
})
