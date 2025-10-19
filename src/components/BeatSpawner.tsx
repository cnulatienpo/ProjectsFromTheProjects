import React, { useEffect, useState } from "react";
import { useBeatUnlocks } from "@/state/useBeatUnlocks";
import "./beat-spawner.css";

export type LessonMeta = {
  id: string;
  beats: string[];
  emoticonColor?: Record<string, string>;
};

type InsertPayload = { type: string; color: string; sourceLesson?: string };

type BeatSpawnerProps = {
  lesson: LessonMeta;
  onInsert: (payload: InsertPayload) => void;
};

export default function BeatSpawner({ lesson, onInsert }: BeatSpawnerProps) {
  const { visibleButtons, hiddenButtons, unlockBeats, hideBeat, showBeat } = useBeatUnlocks();
  const [swapTarget, setSwapTarget] = useState<string | null>(null);
  const swapOptions = [...visibleButtons, ...hiddenButtons];

  useEffect(() => {
    unlockBeats(lesson.id, lesson.beats, lesson.emoticonColor);
  }, [lesson, unlockBeats]);

  useEffect(() => {
    const handleSwapRequest = (event: Event) => {
      const { id } = (event as CustomEvent<{ id: string }>).detail;
      setSwapTarget(id);
    };
    document.addEventListener("beat:request-swap", handleSwapRequest as EventListener);
    return () => document.removeEventListener("beat:request-swap", handleSwapRequest as EventListener);
  }, []);

  useEffect(() => {
    if (!swapTarget) return;
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSwapTarget(null);
      }
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [swapTarget]);

  return (
    <div className="beat-spawner">
      <div className="row">
        {visibleButtons.map((btn) => (
          <button
            key={btn.id}
            className="beat-btn"
            style={{ backgroundColor: btn.color }}
            onClick={() => onInsert({ type: btn.id, color: btn.color, sourceLesson: btn.firstSeenIn })}
            title={btn.label}
          >
            {btn.label}
            <span
              className="hide"
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                hideBeat(btn.id);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  hideBeat(btn.id);
                }
              }}
              aria-label="Hide beat"
            >
              –
            </span>
          </button>
        ))}
      </div>

      {hiddenButtons.length > 0 && (
        <details className="hidden-list">
          <summary>Show hidden ({hiddenButtons.length})</summary>
          <div className="row">
            {hiddenButtons.map((btn) => (
              <button key={btn.id} className="beat-btn ghost" onClick={() => showBeat(btn.id)}>
                {btn.label}
              </button>
            ))}
          </div>
        </details>
      )}

      {swapTarget && (
        <div className="swap-menu" role="dialog" aria-modal="true">
          <div className="swap-card">
            <div className="swap-title">Change Beat Type</div>
            <div className="row">
              {swapOptions.map((btn) => (
                <button
                  key={btn.id}
                  className="beat-btn"
                  style={{ backgroundColor: btn.color }}
                  onClick={() => {
                    document.dispatchEvent(
                      new CustomEvent("beat:perform-swap", {
                        detail: { id: swapTarget, next: { id: btn.id, color: btn.color } },
                        bubbles: true,
                      })
                    );
                    setSwapTarget(null);
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <button className="close" type="button" onClick={() => setSwapTarget(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
