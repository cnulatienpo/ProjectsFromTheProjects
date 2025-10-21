import React from "react";
import { BEATS } from "@shared/beatPalette";

type Props = {
  onPick: (beatKey: string) => void;
  unlocked?: Set<string>;
};
export default function BeatPalette({ onPick, unlocked }: Props) {
  const allow = (k: string) => !unlocked || unlocked.has(k);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {BEATS.map((b) => (
        <button
          key={b.key}
          type="button"
          disabled={!allow(b.key)}
          style={{ background: b.color }}
          className="rounded-xl px-2 py-1 text-sm shadow disabled:opacity-30"
          onClick={() => onPick(b.key)}
          aria-label={`${b.label} (${b.family})`}
        >
          {b.label}
        </button>
      ))}
    </div>
  );
}
