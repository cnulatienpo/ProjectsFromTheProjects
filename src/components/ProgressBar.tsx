import React from "react";

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  const clamped = Math.min(100, Math.max(0, pct));

  return (
    <div
      className="h-2 w-full rounded-md bg-neutral-200 dark:bg-neutral-800"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className="h-2 rounded-md bg-neutral-900 transition-all dark:bg-white"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export default ProgressBar;
