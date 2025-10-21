"use client";
import React, { useCallback, useEffect, useState } from "react";
import EditorWithBeatSpawner from "@/components/EditorWithBeatSpawner";
import FeedbackTray from "@/components/FeedbackTray";
import LogicNavButtons from "@/components/LogicNavButtons";
import HighlightablePassage from "@/components/HighlightablePassage";
import { postJSON } from "@/lib/api";

type PlayParams = {
  params: { mode: string };
};

type Item = {
  id?: string;
  itemId?: string;
  passage?: string;
  mode?: string;
  [key: string]: any;
} | null;

export default function PlayModePage({ params }: PlayParams) {
  const modeParam = params.mode;
  const userId = "dev";

  const [mode, setMode] = useState<string>(modeParam);
  const [item, setItem] = useState<Item>(null);
  const [result, setResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState("");
  const [rationale, setRationale] = useState("");

  const loadNext = useCallback(async () => {
    setIsLoading(true);
    setResult(null);
    setText("");
    setRationale("");
    try {
      const res = await fetch(`/api/next`, { headers: { "x-user-id": userId } });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      const nextItem = data?.item ?? data ?? null;
      setItem(nextItem);
      if (nextItem && typeof nextItem.mode === "string") {
        setMode(nextItem.mode);
      } else {
        setMode(modeParam);
      }
    } catch (error) {
      console.error("Failed to load next item", error);
      setItem(null);
    } finally {
      setIsLoading(false);
    }
  }, [modeParam, userId]);

  const submit = useCallback(async () => {
    const itemId = (item as any)?.itemId ?? (item as any)?.id;
    if (!itemId) return;
    setIsLoading(true);
    setResult(null);
    try {
      const data = await postJSON("/api/attempt", {
        userId,
        itemId,
        mode,
        answer: { text, rationale },
      });
      setResult(data);
    } catch (error) {
      console.error("Failed to submit attempt", error);
    } finally {
      setIsLoading(false);
    }
  }, [item, mode, rationale, text, userId]);

  const skip = useCallback(async () => {
    const itemId = (item as any)?.itemId ?? (item as any)?.id;
    if (!itemId) return;
    setIsLoading(true);
    try {
      await postJSON("/api/skip", {
        userId,
        itemId,
        mode,
        reason: "user_skip",
      });
      await loadNext();
    } catch (error) {
      console.error("Failed to skip item", error);
    } finally {
      setIsLoading(false);
    }
  }, [item, loadNext, mode, userId]);

  const next = useCallback(() => {
    if (!result) return;
    void loadNext();
  }, [result, loadNext]);

  useEffect(() => {
    loadNext();
  }, [loadNext]);

  const canNext = !!result;
  const passage = (item as any)?.passage;

  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[1fr_20rem]">
      <section className="flex flex-col gap-3">
        {passage ? (
          <HighlightablePassage text={passage} spans={result?.spans} />
        ) : null}
        <EditorWithBeatSpawner value={text} onChange={setText} onSubmit={submit} />
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
          <button className="rounded px-3 py-2 border" disabled={isLoading || !item} onClick={submit}>
            Submit
          </button>
        </div>
      </section>

      <FeedbackTray result={result} isLoading={isLoading} />
      <div className="md:col-span-2">
        <LogicNavButtons canNext={canNext} onNext={next} onSkip={skip} isLoading={isLoading} />
      </div>
    </div>
  );
}
