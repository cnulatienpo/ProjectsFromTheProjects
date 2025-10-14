import { type ReactNode } from "react";

type Props = { title: string; note?: string; action?: ReactNode; emoji?: string };

export function EmptyState({ title, note, action, emoji = "🗂️" }: Props) {
  return (
    <section className="rounded-2xl border p-6 text-center shadow-sm">
      <div className="mb-2 text-3xl" aria-hidden="true">
        {emoji}
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      {note && <p className="mt-1 text-sm text-neutral-600">{note}</p>}
      {action && <div className="mt-3">{action}</div>}
    </section>
  );
}
