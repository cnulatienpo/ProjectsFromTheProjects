import type { JSX } from "react";
import { Link } from "react-router-dom";

import { funhousePrompts } from "../data/funhouse-prompts";

function ParagraphList({ text }: { text: string }): JSX.Element {
  const lines = text.split(/\n+/).filter((line) => line.trim().length > 0);

  return (
    <ul className="space-y-2 text-sm leading-relaxed text-neutral-100">
      {lines.map((line, index) => (
        <li
          key={`${index}-${line.slice(0, 12)}`}
          className="rounded border border-neutral-800/60 bg-neutral-900/80 px-3 py-2 shadow-inner shadow-fuchsia-900/40"
        >
          {line}
        </li>
      ))}
    </ul>
  );
}

export default function FunhouseDebug(): JSX.Element {
  const preview = funhousePrompts.slice(0, 3);

  return (
    <div className="min-h-[60vh] w-full bg-gradient-to-br from-neutral-950 via-purple-950 to-orange-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="space-y-4 text-neutral-100">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-orange-300">
            <span className="h-1 w-8 bg-orange-400" aria-hidden />
            Funhouse Debug Channel
            <span className="h-1 w-8 bg-fuchsia-500" aria-hidden />
          </p>
          <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-[0_6px_0_rgba(236,72,153,0.35)]">
            Prompt Remix Control Room
          </h1>
          <p className="max-w-3xl text-base text-neutral-200">
            Behold the first three remixed prompts. Each variant intentionally breaks something—tone, genre, grammar, or your
            faith in coherent prose. Use this page to confirm the remix engine is awake and choosing chaos on purpose.
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-widest text-orange-200">
            <span className="rounded-full border border-orange-400/80 bg-orange-500/20 px-3 py-1">temporary debug</span>
            <Link
              to="/funhouse"
              className="rounded-full border border-fuchsia-400/70 bg-fuchsia-500/20 px-3 py-1 text-fuchsia-100 transition hover:bg-fuchsia-500/40"
            >
              Return to Funhouse Hub
            </Link>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          {preview.map((prompt) => (
            <article
              key={prompt.id}
              className="flex h-full flex-col gap-4 rounded-3xl border-4 border-orange-400/60 bg-neutral-950/80 p-6 shadow-[6px_6px_0_rgba(168,85,247,0.6)]"
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-300">
                  {prompt.source} prompt
                </p>
                <h2 className="text-2xl font-bold text-white">{prompt.title}</h2>
                <p className="text-sm text-orange-100/90">{prompt.instructions}</p>
              </div>

              {prompt.tags.length > 0 ? (
                <ul className="flex flex-wrap gap-2 text-[0.65rem] font-semibold uppercase tracking-wide text-neutral-900">
                  {prompt.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-neutral-100/70 bg-neutral-100 px-3 py-1 text-neutral-900 shadow shadow-orange-500/40"
                    >
                      #{tag}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-2 flex-1 space-y-4">
                {prompt.variants.map((variant) => (
                  <section
                    key={variant.id}
                    className="rounded-2xl border border-fuchsia-500/60 bg-neutral-950/80 p-4 shadow-inner shadow-orange-500/40"
                  >
                    <header className="mb-3 flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-widest text-fuchsia-200">{variant.mode}</p>
                      <span className="rounded-full bg-fuchsia-500/30 px-2 py-1 text-[0.65rem] font-bold text-fuchsia-100">
                        {variant.id.split("-").slice(-1)[0]}
                      </span>
                    </header>
                    <ParagraphList text={variant.instructions} />
                  </section>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
