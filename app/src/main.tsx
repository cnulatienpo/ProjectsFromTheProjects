console.log("[BOOT] main.tsx loaded at", new Date().toISOString());
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const el = document.getElementById("root");
if (!el) throw new Error("Missing #root mount element");

createRoot(el).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
