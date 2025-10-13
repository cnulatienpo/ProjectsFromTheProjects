import { useState, type JSX } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export interface FunhouseGameShellProps {
  title: string;
  lessonId: string;
  mode: string;
  distortion: string;
  description: string;
  promptText?: string;
}

export default function FunhouseGameShell({
  title,
  lessonId,
  mode,
  distortion,
  description,
  promptText,
}: FunhouseGameShellProps): JSX.Element {
  const [text, setText] = useState("");

  return (
    <div
      className="p-6 max-w-3xl mx-auto space-y-6"
      data-lesson-id={lessonId}
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground italic">{description}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Funhouse</Badge>
          <Badge variant="ghost">{distortion}</Badge>
          <Badge variant="secondary" className="font-mono text-xs uppercase">
            Lesson {lessonId}
          </Badge>
        </div>
      </div>

      {promptText && (
        <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900/40 dark:text-neutral-300">
          <h2 className="mb-2 font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Prompt
          </h2>
          <p className="whitespace-pre-wrap leading-relaxed text-neutral-900 dark:text-neutral-100">
            {promptText}
          </p>
        </section>
      )}

      {mode === "text" && (
        <div className="space-y-4">
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Write it all wrong. C’mon. Make it ugly."
            className="min-h-[200px] w-full"
          />
          <div className="flex justify-end">
            <Button variant="secondary">Submit to the Chaos</Button>
          </div>
        </div>
      )}

      {mode === "freeform" && (
        <div className="space-y-4">
          <p>There are no rules in this mode. Write, draw, scream, whatever.</p>
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="The paper is melting. Do something weird."
            className="min-h-[300px] w-full bg-yellow-50 italic"
          />
        </div>
      )}
    </div>
  );
}
