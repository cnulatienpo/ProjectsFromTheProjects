import React from "react";
import { getSigilSyntaxComponent } from "./resolve";

export default function SigilSyntaxGame() {
  const C = getSigilSyntaxComponent();
  if (!C) {
    return (
      <main className="p-6 font-mono text-sm border-t-4 border-black">
        <h1>Sigil &amp; Syntax</h1>
        <p>
          Could not locate the original game entry. Check generically named files like
          <code>app.tsx</code> or <code>page.tsx</code> and ensure they export a default React component.
        </p>
      </main>
    );
  }
  // Render the discovered game
  return <C />;
}
