import type { ReactNode } from "react";

declare module "react-dom/client" {
  interface Root {
    render(children: ReactNode): void;
    unmount(): void;
  }
  function createRoot(container: Element | DocumentFragment): Root;
  function hydrateRoot(container: Element | DocumentFragment, children: ReactNode): Root;
  export { createRoot, hydrateRoot, Root };
}
