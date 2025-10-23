import React from "react";

export default function HighlightablePassage({ text = "", spans = [] }) {
  if (!text) return null;
  const safeSpans = Array.isArray(spans)
    ? spans
        .filter((s) => Number.isFinite(s?.start) && Number.isFinite(s?.end) && s.end > s.start)
        .sort((a, b) => a.start - b.start)
    : [];

  const out = [];
  let i = 0;
  for (const s of safeSpans) {
    if (s.start > i) out.push(<span key={`t-${i}`}>{text.slice(i, s.start)}</span>);
    out.push(
      <mark key={`m-${s.start}-${s.end}`} data-label={s.label || ""}>
        {text.slice(s.start, s.end)}
      </mark>
    );
    i = s.end;
  }
  if (i < text.length) out.push(<span key={`t-end`}>{text.slice(i)}</span>);

  return <p className="whitespace-pre-wrap leading-relaxed">{out}</p>;
}
