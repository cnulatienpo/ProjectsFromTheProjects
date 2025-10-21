import React from "react";

type Props = {
  title?: string;
  definition?: string;
  signals?: string[];
  examples?: string[];
};
export default function NotesPanel({ title, definition, signals, examples }: Props) {
  return (
    <section className="rounded-xl border p-3 flex flex-col gap-2">
      {title && <h3 className="font-semibold">{title}</h3>}
      {definition && <p className="text-sm">{definition}</p>}
      {signals?.length ? (
        <div>
          <div className="text-xs uppercase tracking-wide opacity-70 mb-1">Signals</div>
          <ul className="list-disc pl-5 text-sm">
            {signals.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {examples?.length ? (
        <div>
          <div className="text-xs uppercase tracking-wide opacity-70 mb-1">Examples</div>
          <ul className="list-disc pl-5 text-sm">
            {examples.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
