import React from "react";
import { useProgress } from "../state/useProgress";

export function PointsChip() {
  const points = useProgress((s) => s.points);
  return (
    <div
      className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-3 py-1 text-sm font-medium text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      aria-label={`You have ${points} points`}
      title={`${points} points`}
    >
      <span className="mr-1">★</span>
      <span>{points}</span>
    </div>
  );
}

export default PointsChip;
