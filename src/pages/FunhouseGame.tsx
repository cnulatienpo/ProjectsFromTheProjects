import type { JSX } from "react";
import { Link, useParams } from "react-router-dom";

import { findFunhouseVariantById } from "@/data/funhouse-prompts";

import { GameLoader } from "@/games/fun_house_writing";

export default function FunhouseGame(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const variantInfo = id ? findFunhouseVariantById(id) : null;

  if (!id) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 p-6 text-center">
        <p className="text-lg font-semibold">No Funhouse game selected.</p>
        <Link
          to="/funhouse"
          className="mx-auto inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Browse Funhouse variants
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4">
      {variantInfo ? (
        <section className="rounded-3xl border border-purple-500/40 bg-gradient-to-br from-purple-950/70 via-neutral-950/60 to-orange-900/40 p-6 shadow-[6px_6px_0_rgba(168,85,247,0.45)]">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-200">
              {variantInfo.prompt.source} funhouse remix
            </p>
            <span className="rounded-full border border-purple-400/60 bg-purple-500/30 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-purple-100">
              {variantInfo.variant.mode}
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-white">{variantInfo.prompt.title}</h1>
          <p className="mt-2 text-sm text-purple-100/90">
            Original instructions: {variantInfo.prompt.instructions}
          </p>
          <div className="mt-4 space-y-2 text-sm text-orange-100">
            {variantInfo.variant.instructions
              .split(/\n+/)
              .filter((line) => line.trim().length > 0)
              .map((line, index) => (
                <p
                  key={`${variantInfo.variant.id}-${index}`}
                  className="rounded-xl border border-purple-400/30 bg-purple-950/50 px-3 py-2 text-left leading-relaxed shadow-inner shadow-orange-500/30"
                >
                  {line}
                </p>
              ))}
          </div>
        </section>
      ) : null}

      <GameLoader id={id} />
    </div>
  );
}
