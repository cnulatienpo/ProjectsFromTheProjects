import clsx from 'clsx';
import type { WordEntry } from '../types';

interface WordCardProps {
  entry: WordEntry;
  className?: string;
}

export function WordCard({ entry, className }: WordCardProps) {
  return (
    <article
      className={clsx(
        'rounded-xl border border-brand/10 bg-white p-5 shadow-sm transition hover:shadow-md',
        className
      )}
    >
      <h2 className="font-display text-2xl font-semibold text-brand sm:text-3xl">
        {entry.word}
      </h2>
      <p className="mt-3 text-sm text-brand/80">
        <span className="font-medium text-brand">Story:</span> from {entry.from.language}, root "
        {entry.from.root}" meaning "{entry.from.gloss}"
      </p>
      <p className="mt-2 text-sm text-brand/80">
        <span className="font-medium text-brand">Literal:</span> "{entry.literal}"
      </p>
    </article>
  );
}

export default WordCard;
