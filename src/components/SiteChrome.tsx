import type { PropsWithChildren } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ToastHost } from "./ToastHost";
import { KeyOverlay } from "./KeyOverlay";
import CookieNotice from "./CookieNotice";

export default function SiteChrome({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <Header />
      <ToastHost />
      <KeyOverlay />
      <main>{children}</main>
      <Footer />
      <CookieNotice />
    </div>
  );
}
