import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const base = process.env.VITE_PAGES_BASE || "/";

export default defineConfig({
  base,
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: {
    open: "/",
    proxy: {
      "/sigil": {
        target: process.env.VITE_DEV_API || "http://localhost:3001",
        changeOrigin: true
      },
      "/cut-games": {
        target: process.env.VITE_DEV_API || "http://localhost:3001",
        changeOrigin: true
      },
      "/api": {
        target: process.env.VITE_DEV_API || "http://localhost:3001",
        changeOrigin: true
      }
    }
  },
  build: { sourcemap: true },
});
