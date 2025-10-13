import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // IMPORTANT: set to your repo name with leading/trailing slashes
  // Example: base: "/the-good-word/"
  base: "/ProjectsFromTheProjects/",
  build: { sourcemap: true, outDir: "dist" },
});
