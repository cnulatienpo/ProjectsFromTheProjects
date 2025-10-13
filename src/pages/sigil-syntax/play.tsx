import React, { Suspense, useEffect, useMemo, useState } from "react";
import { loadComponent, resolveOriginalScreens } from "@/games/original.resolve";

export default function SigilSyntaxPlay() {
  const [Comp, setComp] = useState<React.ComponentType<any> | null>(null);
  const screens = useMemo(() => resolveOriginalScreens(), []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.info("[sigil&syntax] launching ORIGINAL/play");
    }
    const path = screens.play || screens.home || screens.fallbacks[0];
    if (path) {
      loadComponent(path).then(setComp);
    }
  }, [screens]);

  if (!Comp) {
    return <div style={{ padding: 20 }}>Loading Sigil &amp; Syntax…</div>;
  }

  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Loading…</div>}>
      <Comp />
    </Suspense>
  );
}
