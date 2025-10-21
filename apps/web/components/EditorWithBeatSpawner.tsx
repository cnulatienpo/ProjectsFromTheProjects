import React, { useRef } from "react";
import BeatPalette from "./BeatPalette";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  onPickBeat?: (beatKey: string) => void;
};
export default function EditorWithBeatSpawner({
  value,
  onChange,
  onSubmit,
  onPickBeat,
}: Props) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const insert = (beat: string) => {
    const ta = taRef.current;
    const caret = ta ? ta.selectionStart : value.length;
    const token = `[${beat.toUpperCase()}]`;
    const next = value.slice(0, caret) + token + value.slice(caret);
    onChange(next);
    requestAnimationFrame(() => {
      if (ta) {
        const p = caret + token.length;
        ta.selectionStart = ta.selectionEnd = p;
        ta.focus();
      }
    });
  };
  return (
    <div className="flex flex-col gap-3">
      <BeatPalette onPick={onPickBeat ?? insert} />
      <textarea
        ref={taRef}
        className="w-full min-h-[240px] rounded-xl border p-3 leading-6"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            onSubmit?.();
          }
        }}
        placeholder="Write here. Insert beats like [ACTION] [REVEAL] …"
      />
      <div className="text-xs opacity-70">Pro tip: ⌘/Ctrl+Enter submits.</div>
    </div>
  );
}
