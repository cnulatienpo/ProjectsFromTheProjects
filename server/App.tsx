// src/App.tsx
import React from "react";
import { HashRouter, Routes, Route, Navigate, Link } from "react-router-dom";

/** discover pages in /pages and /src/pages (tsx/jsx; default or named component) */
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
  if (mod?.default && isReactComponent(mod.default)) return mod.default;
  for (const k of Object.keys(mod || {})) {
    if (k !== "default" && isReactComponent(mod[k])) return mod[k];
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

const entries: PageEntry[] = Object.entries(modules).flatMap(([file, mod]) => {
  const C = pickComponent(mod);
  if (!C) return [];
  return [{ path: normalizeToRoute(file), Component: C, file }];
});
const seen = new Set<string>();
const routes = entries.filter((p) => (seen.has(p.path) ? false : (seen.add(p.path), true)));

// choose your home: first discovered route, or force one like "/play"
const HOME = routes.find(r => r.path === "/" ) ? "/" : (routes[0]?.path || "/");

function Nav() {
  return (
    <nav style={{display:"flex",gap:12,flexWrap:"wrap",padding:"10px 16px",borderBottom:"1px solid #eee",fontFamily:"system-ui, sans-serif"}}>
      <strong style={{marginRight:8}}>LD</strong>
      {routes.map(r => (
        <Link key={r.path||"/"} to={r.path||"/"} style={{textDecoration:"none"}}>
          #{r.path||"/"}
        </Link>
      ))}
      <span style={{marginLeft:"auto",opacity:.6}}>hash router</span>
    </nav>
  );
}

function DebugRoutes() {
  return (
    <div style={{padding:20,fontFamily:"system-ui, sans-serif"}}>
      <h1>Discovered Routes</h1>
      <ul>
        {routes.map(r => (
          <li key={r.path}><a href={`#${r.path||"/"}`}>{r.path || "/"}</a> <small style={{opacity:.6}}>← {r.file}</small></li>
        ))}
      </ul>
      <p>Tip: use the nav links above, e.g. <code>#{HOME}</code>.</p>
    </div>
  );
}

export function App() {
  console.info("[vite] routes:", routes.map(r => r.path));
  return (
    <HashRouter>
      <Nav />
      <Routes>
        {/* redirect hash root to HOME */}
        <Route path="/" element={<Navigate to={HOME} replace />} />

        {/* mount every discovered page */}
        {routes.map(({ path, Component }) => (
          <Route key={path || "/"} path={path || "/"} element={<Component />} />
        ))}

        {/* debug inspector */}
        <Route path="__routes" element={<DebugRoutes />} />

        {/* final catch-all → debug */}
        <Route path="*" element={<DebugRoutes />} />
      </Routes>
    </HashRouter>
  );
}
