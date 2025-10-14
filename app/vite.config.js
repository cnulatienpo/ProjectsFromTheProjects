import { defineConfig } from 'vite'
import path from 'path'

const REPO = process.env.GHPAGES_REPO || 'ProjectsFromTheProjects'

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@sigil': path.resolve(__dirname, 'src/sigil-syntax'),
    },
  },
  base: process.env.GHPAGES_BASE || `/${REPO}/`,
})
