"use client";
import React, { useEffect, useState } from "react";
import { useAttempt } from "@/hooks/useAttempt";
import EditorWithBeatSpawner from "@/components/EditorWithBeatSpawner";
import FeedbackTray from "@/components/FeedbackTray";
import LogicNavButtons from "@/components/LogicNavButtons";
import HighlightablePassage from "@/components/HighlightablePassage";
import NotesPanel from "@/components/NotesPanel";

export default function PlayModePage({ params }: { params: { mode: string } }) {
  const mode = params.mode;
  const { current, loadNext, submit, result, isLoading } = useAttempt(mode);
  const [text, setText] = useState("");
  const [rationale, setRationale] = useState("");
  const [notes, setNotes] = useState<string | undefined>();

  useEffect(() => {
    loadNext();
  }, []);

  const onSubmit = async () => {
    if (!current) return;
    await submit(current.itemId, { text, rationale });
  };
  const onNext = async () => {
    setText("");
    setRationale("");
    setNotes(undefined);
    await loadNext();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_20rem] gap-4 p-4">
      <section className="flex flex-col gap-3">
        {current?.passage ? (
          <HighlightablePassage text={current.passage} spans={result?.spans} />
        ) : null}
        <EditorWithBeatSpawner value={text} onChange={setText} onSubmit={onSubmit} />
        <label className="text-sm" htmlFor="rationale-input">
          Why did you do that?
        </label>
        <textarea
          id="rationale-input"
          className="rounded border p-2"
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
        />
        <div className="flex gap-2">
          <button className="rounded px-3 py-2 border" disabled={isLoading} onClick={onSubmit}>
            Submit
          </button>
        </div>
        {current?.meta?.lesson && <NotesPanel {...current.meta.lesson} />}
      </section>

      <FeedbackTray result={result} notes={notes} onChangeNotes={setNotes} />
      <div className="md:col-span-2">
        <LogicNavButtons
          canNext={!!result}
          isLoading={isLoading}
          onNext={onNext}
          onRetry={() => setText(text)}
          onQueue={() => {}}
        />
      </div>
    </div>
  );
}
