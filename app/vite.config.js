import config from './vite.config.ts'

const baseServer = config.server || {}
const baseProxy = baseServer.proxy || {}

export default {
  ...config,
  server: {
    ...baseServer,
    port: 5173,
    strictPort: true,
    proxy: {
      ...baseProxy,
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        // no rewrite: keep /api prefix intact
      },
    },
  },
}
