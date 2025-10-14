import { copyFileSync } from "fs";
copyFileSync("dist/index.html", "dist/404.html");
console.log("Copied index.html → 404.html (SPA fallback ready)");
