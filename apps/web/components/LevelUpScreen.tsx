import React from "react";

type Props = {
  level: number;
  badges?: string[];
  memo?: { title: string; body: string };
};
export default function LevelUpScreen({ level, badges, memo }: Props) {
  return (
    <section className="rounded-xl border p-4 space-y-3">
      <h2 className="text-xl font-semibold">Level {level}</h2>
      {badges?.length ? (
        <div className="flex flex-wrap gap-2">
          {badges.map((b) => (
            <span key={b} className="rounded-full border px-2 py-1 text-xs">
              {b}
            </span>
          ))}
        </div>
      ) : null}
      {memo ? (
        <article className="rounded-lg border p-3 bg-white">
          <h3 className="font-medium">{memo.title}</h3>
          <p className="whitespace-pre-wrap text-sm leading-6">{memo.body}</p>
        </article>
      ) : null}
    </section>
  );
}
