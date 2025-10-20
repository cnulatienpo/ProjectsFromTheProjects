import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useBeatUnlocks } from "@/state/useBeatUnlocks";
import { emojiForBeat } from "@/lib/beatEmoticons";

export type BeatRailOverlayProps = {
  emoticonMap?: Record<string, string>;
  colorMap?: Record<string, string>;
  editorSelectorHints?: string[];
  onInsert?: (payload: { type: string; color: string; sourceLesson?: string }) => void;
};

const DEFAULT_HINTS = [
  "[data-editor-root]",
  ".sigil-editor",
  ".ProseMirror",
  'textarea[name="sigil"]',
  "#editor",
  ".editor",
  ".write",
  ".content",
];

function pickColor(
  beatId: string,
  beatColor: string | undefined,
  colorMap?: Record<string, string>
) {
  if (colorMap?.[beatId]) return colorMap[beatId];
  return beatColor ?? "hsl(0 0% 80%)";
}

export default function BeatRailOverlay({
  emoticonMap,
  colorMap,
  editorSelectorHints,
  onInsert,
}: BeatRailOverlayProps) {
  const canUseDom = typeof window !== "undefined" && typeof document !== "undefined";
  const { visibleButtons } = useBeatUnlocks();
  const [host, setHost] = useState<HTMLElement | null>(null);
  const hints = useMemo(
    () =>
      editorSelectorHints && editorSelectorHints.length > 0
        ? editorSelectorHints
        : DEFAULT_HINTS,
    [editorSelectorHints]
  );

  useEffect(() => {
    if (!canUseDom) return;

    let chosen: HTMLElement | null = null;
    for (const selector of hints) {
      const match = document.querySelector(selector);
      if (match instanceof HTMLElement) {
        chosen = match;
        break;
      }
    }

    if (!chosen) {
      const candidates = Array.from(
        document.querySelectorAll<HTMLElement>("textarea, [contenteditable='true']")
      );
      if (candidates.length > 0) {
        candidates.sort(
          (a, b) => b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight
        );
        chosen = candidates[0] ?? null;
      }
    }

    if (!chosen) {
      console.warn("[BeatRailOverlay] Could not find editor host. Consider providing hints.");
    }

    setHost(chosen);
  }, [canUseDom, hints]);

  const [rect, setRect] = useState<DOMRect | null>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!host || !canUseDom) return;

    const update = () => {
      const next = host.getBoundingClientRect();
      setRect(next);
    };

    update();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(update);
      observer.observe(host);
      resizeObserver.current = observer;
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      resizeObserver.current?.disconnect();
      resizeObserver.current = null;
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [host, canUseDom]);

  const [hidden, setHidden] = useState<boolean>(false);

  useEffect(() => {
    if (!canUseDom) return;

    if (window.localStorage.getItem("LD_NO_RAIL") === "1") {
      setHidden(true);
      return;
    }

    const handleKey = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "b") {
        setHidden((current) => !current);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [canUseDom]);

  if (!canUseDom || visibleButtons.length === 0 || !host || !rect || hidden) {
    return null;
  }

  const twoColumns = visibleButtons.length > 12;
  const buttonSize = 28;
  const gap = 8;
  const columnCount = twoColumns ? 2 : 1;
  const railWidth = columnCount * buttonSize + (columnCount - 1) * gap + 12;
  const left = Math.max(8, rect.left - railWidth - gap);

  const top = Math.max(8, rect.top);
  const height = Math.max(48, rect.height);

  const rail = (
    <aside
      role="complementary"
      aria-label="Beat rail"
      style={{
        position: "fixed",
        left,
        top,
        height,
        width: railWidth,
        display: "grid",
        gridTemplateColumns: twoColumns ? "1fr 1fr" : "1fr",
        alignContent: "start",
        gap,
        padding: 6,
        background: "rgba(255, 255, 255, 0.95)",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        borderRadius: 8,
        zIndex: 10_000,
        pointerEvents: "auto",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
      }}
      onMouseDown={(event) => event.stopPropagation()}
    >
      {visibleButtons.map((button) => {
        const color = pickColor(button.id, button.color, colorMap);
        const emoji = emojiForBeat(button.id, emoticonMap);
        return (
          <button
            key={button.id}
            title={button.label}
            style={{
              width: buttonSize,
              height: buttonSize,
              borderRadius: 8,
              border: 0,
              background: color,
              display: "grid",
              placeItems: "center",
              boxShadow:
                "0 0 0 1px rgba(0, 0, 0, 0.12) inset, 0 1px 2px rgba(0, 0, 0, 0.06)",
              cursor: "pointer",
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onInsert?.({ type: button.id, color, sourceLesson: button.firstSeenIn });
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1, userSelect: "none" }}>{emoji}</span>
          </button>
        );
      })}
    </aside>
  );

  return createPortal(rail, document.body);
}
