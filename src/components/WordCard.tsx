import React from "react";

export type Entry = {
  word: string;
  from: { language: string; root: string; gloss: string };
  literal: string;
};

export function WordCard({ e }: { e: Entry }) {
  return (
    <article className="mx-auto max-w-xl rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <h1 className="mb-3 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">{e.word}</h1>
      <p className="text-sm text-neutral-700 dark:text-neutral-300">
        <span className="font-medium">Story:</span>{" "}
        from <span className="italic">{e.from.language}</span>, root “{e.from.root}” meaning “{e.from.gloss}”
      </p>
      <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
        <span className="font-medium">Literal:</span> “{e.literal}”
      </p>
    </article>
  );
}

export default WordCard;
