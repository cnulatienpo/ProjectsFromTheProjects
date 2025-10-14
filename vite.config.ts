import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

function ghPagesBase() {
  const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
  return repo ? `/${repo}/` : "/";
}

export default defineConfig(({ command }) => ({
  base: command === "serve" ? "/" : ghPagesBase(),
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: { open: "/" },
  build: { sourcemap: true },
}));
