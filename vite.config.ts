import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  base: process.env.GITHUB_REPOSITORY
    ? "/" + process.env.GITHUB_REPOSITORY.split("/")[1] + "/"
    : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: { sourcemap: true, outDir: "dist" },
});
