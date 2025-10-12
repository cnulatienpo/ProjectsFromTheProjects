import clsx from "clsx";

export default function ProgressBar({ total, index, className }: { total: number; index: number; className?: string }) {
  const pct = total <= 0 ? 0 : Math.min(100, Math.round((Math.min(total, index + 1) / total) * 100));
  return (
    <div
      className={clsx("progress-track", className)}
      aria-label="round progress"
      aria-valuemin={0}
      aria-valuemax={total > 0 ? total : undefined}
      aria-valuenow={total > 0 ? Math.min(total, index + 1) : undefined}
      role="progressbar"
      data-testid="cutgames-round-progress-bar"
    >
      <div className="progress-bar" style={{ width: `${pct}%` }} />
    </div>
  );
}
