import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load .env if present
const DOT = path.resolve(process.cwd(), 'server', '.env')
if (fs.existsSync(DOT)) dotenv.config({ path: DOT })

// Helpers
const bool = (v, d = false) => {
    if (v == null) return d
    const s = String(v).toLowerCase()
    return ['1', 'true', 'yes', 'on'].includes(s)
}
const arr = (v) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : [])

export const ENV = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: Number(process.env.PORT || 3001),
    HOST: process.env.HOST || '0.0.0.0',

    // GitHub Pages origin (top-level). Example: https://<user>.github.io
    ORIGIN_PAGES: process.env.ORIGIN_PAGES || '',
    // Optional extra origins (comma-separated) e.g. https://<user>.github.io/<repo>,https://my-frontend.example.com
    ORIGIN_EXTRA: arr(process.env.ORIGIN_EXTRA),

    // Allow localhost during dev
    ALLOW_LOCALHOST: bool(process.env.ALLOW_LOCALHOST, true),

    // Build/version stamps (optional)
    BUILD_STAMP: process.env.BUILD_STAMP || '',
    VERSION: process.env.VERSION || '',

    // Authentication
    REQUIRE_AUTH: (process.env.REQUIRE_AUTH || '').trim() === '1',
    AUTH_USER: process.env.AUTH_USER || '',
    AUTH_PASS: process.env.AUTH_PASS || ''
}
