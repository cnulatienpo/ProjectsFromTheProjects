import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const REPO = process.env.GHPAGES_REPO || 'ProjectsFromTheProjects'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  base: process.env.GHPAGES_BASE || `/${REPO}/`,
})
