import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

// Optional: hybrid API boot (ignore if file missing)
try {
    const mod = await import("./lib/api-boot");
    await mod.bootApi?.();
} catch { }

console.info("[vite] UI booting…");
const root = document.getElementById("root");
if (!root) {
    const div = document.createElement("div");
    div.id = "root";
    document.body.appendChild(div);
    createRoot(div).render(<App />);
} else {
    createRoot(root).render(<App />);
}
