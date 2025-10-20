import React, { useMemo } from "react";
import { useBeatUnlocks } from "@/state/useBeatUnlocks";
import { emojiForBeat } from "@/lib/beatEmoticons";
import "./beat-rail.css";

export type BeatRailProps = {
  // The writing box container will position this rail.
  // Provide the current lesson meta so colors/emoticons can override.
  lessonId: string;
  emoticonColor?: Record<string, string>;  // beatId -> hex color
  emoticonMap?: Record<string, string>;    // beatId -> emoji
  onInsert: (payload: { type: string; color: string; sourceLesson?: string }) => void;
  // Optional: when true, force two columns
  forceTwoCols?: boolean;
};

export default function BeatRail(props: BeatRailProps) {
  const { visibleButtons } = useBeatUnlocks();

  // Derive whether we need 1 or 2 columns (auto)
  const twoCols = useMemo(() => {
    // threshold tuned for ~28px buttons + gaps; adjust if needed
    return props.forceTwoCols || visibleButtons.length > 14;
  }, [visibleButtons.length, props.forceTwoCols]);

  return (
    <aside className={`beat-rail ${twoCols ? "two" : "one"}`} aria-label="Beat buttons">
      <div className="rail-grid">
        {visibleButtons.map((btn) => {
          const color = props.emoticonColor?.[btn.id] || btn.color || "#e0e0e0";
          const emoji = emojiForBeat(btn.id, props.emoticonMap);
          return (
            <button
              key={btn.id}
              className="rail-btn"
              style={{ backgroundColor: color }}
              title={btn.label}
              onClick={() => props.onInsert({ type: btn.id, color, sourceLesson: btn.firstSeenIn })}
            >
              <span className="emoji">{emoji}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
