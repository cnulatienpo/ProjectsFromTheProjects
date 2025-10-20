import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ErrorBoundary, DebugOverlay } from "./DebugOverlay";

/* dev: unregister service workers to prevent stale CSP/assets */
if (import.meta?.env?.DEV && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((reg) => reg.unregister()));
    if (typeof caches !== 'undefined') {
      caches.keys?.().then((keys) => keys.forEach((key) => caches.delete(key))).catch(() => {});
    }
  } catch (err) {
    console.warn('[DEV] failed to unregister service workers', err);
  }
}

console.log("[BOOT] main.tsx loaded at", new Date().toISOString());

const el = document.getElementById("root");
if (!el) throw new Error("Missing #root mount element");

createRoot(el).render(
    <ErrorBoundary>
        <DebugOverlay />
        <React.StrictMode>
            <App />
        </React.StrictMode>
    </ErrorBoundary>
);
