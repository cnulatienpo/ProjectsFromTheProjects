import type { JSX } from "react";

export interface FunhouseGameShellProps {
  title: string;
  lessonId: string;
  mode: string;
  distortion: string;
  description: string;
}

export default function FunhouseGameShell({
  title,
  lessonId,
  mode,
  distortion,
  description,
}: FunhouseGameShellProps): JSX.Element {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <header className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Funhouse Variant
        </p>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Remixed from lesson <span className="font-mono text-xs">{lessonId}</span>
        </p>
      </header>
      <section className="space-y-3">
        <p className="text-base leading-relaxed text-neutral-700 dark:text-neutral-200">{description}</p>
        <dl className="grid grid-cols-1 gap-2 text-sm text-neutral-600 dark:text-neutral-300 sm:grid-cols-2">
          <div className="rounded-lg bg-neutral-100 p-3 dark:bg-neutral-800">
            <dt className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Mode</dt>
            <dd className="text-base font-medium text-neutral-900 dark:text-neutral-100">{mode}</dd>
          </div>
          <div className="rounded-lg bg-neutral-100 p-3 dark:bg-neutral-800">
            <dt className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Distortion</dt>
            <dd className="text-base font-medium text-neutral-900 dark:text-neutral-100">{distortion}</dd>
          </div>
        </dl>
      </section>
      <footer className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900 dark:bg-blue-950 dark:text-blue-100">
        <p>
          Use this shell as a starting point for implementing the interactive experience for{" "}
          <span className="font-semibold">{title}</span>. Wire it up to the correct funhouse game UI and have fun breaking the
          rules.
        </p>
      </footer>
    </article>
  );
}
