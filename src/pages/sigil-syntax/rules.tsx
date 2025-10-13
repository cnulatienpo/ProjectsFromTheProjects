import React, { Suspense, useEffect, useMemo, useState } from "react";
import { loadComponent, resolveOriginalScreens } from "@/games/original.resolve";
import { Guard } from "@/games/guard";
import { GameMenu } from "@/games/menu";

export default function SigilSyntaxRules() {
  const [Comp, setComp] = useState<React.ComponentType<any> | null>(null);
  const screens = useMemo(() => resolveOriginalScreens(), []);

  useEffect(() => {
    let cancelled = false;
    if (typeof window !== "undefined") {
      console.info("[sigil&syntax] launching ORIGINAL rules");
    }
    const path = screens.rules || screens.play || screens.home || screens.fallbacks[0];
    if (path) {
      loadComponent(path)
        .then((component) => {
          if (!cancelled) {
            setComp(() => component);
          }
        })
        .catch((error) => {
          if (!cancelled) {
            console.error("[sigil&syntax] failed to load rules", path, error);
          }
        });
    }
    return () => {
      cancelled = true;
    };
  }, [screens]);

  if (!Comp) {
    return <div style={{ padding: 20 }}>Loading Sigil &amp; Syntax…</div>;
  }

  return (
    <Guard gameId="original">
      <GameMenu base="/sigil-syntax" />
      <Suspense fallback={<div style={{ padding: 20 }}>Loading…</div>}>
        <Comp />
      </Suspense>
    </Guard>
  );
}
