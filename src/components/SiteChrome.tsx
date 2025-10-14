import type { PropsWithChildren } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ToastHost } from "./ToastHost";
import { KeyOverlay } from "./KeyOverlay";
import CookieNotice from "./CookieNotice";

export default function SiteChrome({ children }: PropsWithChildren) {
  const location = useLocation();
  const base = (import.meta as any).env?.BASE_URL || "/";

  // Resolve a base-agnostic path: turns "/<repo>/" → "/", "/<repo>/games" → "/games"
  function rel(p: string) {
    if (!base || base === "/") return p;
    return p.startsWith(base) ? p.slice(base.length - 1) : p;
  }

  const path = rel(location.pathname) || "/";
  const hideTopNav = path === "/" || path === "/games";

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {!hideTopNav && <Header />}
      <ToastHost />
      <KeyOverlay />
      <main>{children}</main>
      <Footer />
      <CookieNotice />
    </div>
  );
}
