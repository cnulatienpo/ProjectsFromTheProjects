import React from "react";

type Props = {
  result?: any;
  notes?: string;
  onChangeNotes?: (v: string) => void;
  children?: React.ReactNode;
};
export default function FeedbackTray({
  result,
  notes,
  onChangeNotes,
  children,
}: Props) {
  const auto = [
    result?.score != null ? `Score: ${(result.score * 100).toFixed(0)}%` : "",
    result?.rubric?.length ? `Rubric: ${result.rubric.join(", ")}` : "",
    result?.details?.message ?? "",
  ]
    .filter(Boolean)
    .join("\n");
  return (
    <aside className="w-full md:w-80 shrink-0 flex flex-col gap-2">
      <label className="text-sm font-medium">Feedback</label>
      <textarea
        className="w-full min-h-[200px] rounded-xl border p-2"
        value={notes ?? auto}
        onChange={(e) => onChangeNotes?.(e.target.value)}
        placeholder="Feedback prints here; you can type over it."
      />
      {result?.next && (
        <div className="text-xs opacity-70">Next hint: {result.next}</div>
      )}
      {children}
    </aside>
  );
}
