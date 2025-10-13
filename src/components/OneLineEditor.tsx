import { useEffect, useState, type ChangeEvent, type JSX } from "react";

import { Button } from "@/components/ui/button";

interface OneLineEditorProps {
  onHideTextarea?: () => void;
  onRevealTextarea?: () => void;
}

export function OneLineEditor({ onHideTextarea, onRevealTextarea }: OneLineEditorProps): JSX.Element {
  const [lines, setLines] = useState<string[]>([""]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    onHideTextarea?.();
    return () => {
      onRevealTextarea?.();
    };
  }, [onHideTextarea, onRevealTextarea]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const updated = [...lines];
    updated[index] = event.target.value;
    setLines(updated);
  };

  const addLine = () => {
    setLines((previous) => [...previous, ""]);
    setIndex((previous) => previous + 1);
    onRevealTextarea?.();
  };

  return (
    <div className="space-y-2 rounded-xl border border-purple-200/40 bg-purple-950/40 p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-purple-200/80">One line staging</p>
      <textarea
        value={lines[index] ?? ""}
        onChange={handleChange}
        rows={2}
        className="w-full resize-none rounded-lg border border-purple-300/60 bg-purple-950/70 p-2 text-sm text-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
      <Button onClick={addLine} className="border border-purple-300/70 bg-purple-100 text-purple-900">
        Next Line ➕
      </Button>
    </div>
  );
}
