import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import GameRoot from "./pages/GameRoot"; // adjust path if needed

const modules = import.meta.glob(
    [
        "/src/pages/**/*.{tsx,jsx}",
        "/pages/**/*.{tsx,jsx}",
        "./src/pages/**/*.{tsx,jsx}",
        "./pages/**/*.{tsx,jsx}",
    ],
    { eager: true }
) as Record<string, any>;

type PageEntry = { path: string; Component: React.ComponentType<any>; file: string };

function isReactComponent(v: any) {
    if (!v) return false;
    if (typeof v === "function") return true;
    if (typeof v === "object" && v.$$typeof) return true;
    return false;
}

function pickComponent(mod: any) {
    if (!mod || typeof mod !== "object") return null;
    if (isReactComponent(mod.default)) return mod.default;
    for (const k of Object.keys(mod)) {
        if (k === "default") continue;
        if (isReactComponent(mod[k])) return mod[k];
    }
    return null;
}

function normalizeToRoute(file: string): string {
    let rel = file
        .replace(/^\/?src\//, "")
        .replace(/^\/?pages\//, "")
        .replace(/^.*?pages\//, "")
        .replace(/\.(t|j)sx?$/i, "");
    rel = rel.replace(/\/index$/i, "");
    if (/^index$/i.test(rel)) rel = "";
    return "/" + rel.replace(/^\/+/, "");
}

const pageEntries: PageEntry[] = Object.entries(modules).flatMap(([file, mod]) => {
    const C = pickComponent(mod);
    if (!C) return [];
    const path = normalizeToRoute(file);
    return [{ path, Component: C, file }];
});

const seen = new Set<string>();
const routes = pageEntries.filter(p => (seen.has(p.path) ? false : (seen.add(p.path), true)));

function DebugRoutes() {
    return (
        <div style={{ padding: 20, fontFamily: "system-ui, sans-serif" }}>
            <h1>Discovered Routes</h1>
            <p>HashRouter base: <code>#/</code></p>
            <ul>
                {routes.map(r => (
                    <li key={r.path}>
                        <code>{r.path || "/"}</code> <small style={{ opacity: .7 }}>← {r.file}</small>
                    </li>
                ))}
            </ul>
            <p>Try navigating to the paths above (e.g., <code>#/play</code>).</p>
        </div>
    );
}

function TestPage() {
    return <div style={{ padding: 16 }}><h2>Test Route ✅</h2></div>
}

export function App() {
    console.info("[vite] routes:", routes.map(r => r.path));
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<GameRoot />} />
                <Route path="*" element={<GameRoot />} />
            </Routes>
        </HashRouter>
    );
}
