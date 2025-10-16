import { defineConfig } from '@playwright/test'

// Vite preview uses 5173 per app/vite.config.js
export default defineConfig({
  testDir: './tests',
  reporter: [['list'], ['html', { outputFolder: './test-output/html' }]],
  use: {
    baseURL: 'http://localhost:5173/projects-from-the-projects',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'npm run snap:preview',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  outputDir: './test-output/run'
})
