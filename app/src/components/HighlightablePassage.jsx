import React from "react";

export default function HighlightablePassage({ text, spans = [] }) {
    if (!spans.length) return <pre className="whitespace-pre-wrap">{text}</pre>;
    const sorted = [...spans].sort((a, b) => a.start - b.start);
    const parts = [];
    let i = 0;
    sorted.forEach((s, idx) => {
        if (s.start > i) parts.push(<span key={`t-${idx}-pre`}>{text.slice(i, s.start)}</span>);
        parts.push(
            <mark key={`m-${idx}`} className="bg-yellow-200">
                {text.slice(s.start, s.end)}
            </mark>
        );
        i = s.end;
    });
    if (i < text.length) parts.push(<span key="t-last">{text.slice(i)}</span>);
    return <pre className="whitespace-pre-wrap">{parts}</pre>;
}
