import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PracticeItem,
  PracticeMode,
  RoundItemAnswer,
  RoundMode,
  SubmitRoundResponse,
  fetchPractice,
  sendTelemetrySkip,
  submitRound,
} from "../../lib/cutGamesClient";
import ProgressBar from "./ProgressBar";
import SceneCard from "./SceneCard";

const ITEMS_PER_ROUND = 5;

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || target.isContentEditable;
};

type SubmitPayload = Parameters<typeof submitRound>[0];
type RoundSummary = { completed: number; skipped: number };

export type RoundCompletion = {
  score: number;
  notes: string[];
  id?: string;
  summary: RoundSummary;
  payload: SubmitPayload;
  response: SubmitRoundResponse;
};

type Props = {
  modeName: RoundMode;
  beat?: string;
  pitfall?: string;
  practiceModeOverride?: PracticeMode;
  onDone: (result: RoundCompletion) => void;
  onSubmitError?: (error: string) => void;
};

export default function RoundEngine({
  modeName,
  beat,
  pitfall,
  practiceModeOverride,
  onDone,
  onSubmitError,
}: Props) {
  const [queue, setQueue] = useState<PracticeItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<RoundItemAnswer[]>([]);
  const [startedAt, setStartedAt] = useState<string>(() => new Date().toISOString());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const modeKind: PracticeMode = useMemo(() => {
    if (practiceModeOverride) return practiceModeOverride;
    if (pitfall) return "bad";
    return modeName === "Fix" ? "bad" : "good";
  }, [modeName, pitfall, practiceModeOverride]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSubmitError(null);
    setQueue([]);
    setIdx(0);
    setAnswer("");
    setAnswers([]);
    setHasSubmitted(false);
    const run = async () => {
      try {
        const items = await fetchPractice({ mode: modeKind, beat, pitfall });
        if (cancelled) return;
        const trimmed = (items ?? []).slice(0, ITEMS_PER_ROUND);
        setQueue(trimmed);
        setStartedAt(new Date().toISOString());
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message || "Failed to load practice");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [modeKind, beat, pitfall]);

  const current = queue[idx];
  const finished = idx >= queue.length && queue.length > 0;

  const recordAnswer = useCallback(
    (entry: RoundItemAnswer) => {
      setAnswers((prev) => {
        const next = prev.filter((item) => item.itemId !== entry.itemId);
        return [...next, entry];
      });
    },
    [],
  );

  const next = useCallback(() => {
    setIdx((prev) => {
      if (prev >= queue.length) return prev;
      const nextIndex = Math.min(prev + 1, queue.length);
      if (nextIndex !== prev) {
        setAnswer("");
      }
      return nextIndex;
    });
  }, [queue.length]);

  const onSkip = useCallback(async () => {
    if (!current || submitting) return;
    recordAnswer({
      itemId: current.id,
      mode: modeKind,
      beat,
      pitfall,
      skipped: true,
    });
    try {
      await sendTelemetrySkip(modeKind, {
        beat: current.beat ?? undefined,
        pitfall: current.pitfall ?? undefined,
        type: current.type ?? undefined,
      });
    } catch (err) {
      console.warn("Failed to send skip telemetry", err);
    }
    next();
  }, [current, submitting, recordAnswer, modeKind, beat, pitfall, next]);

  const onComplete = useCallback(() => {
    if (!current || submitting) return;
    recordAnswer({
      itemId: current.id,
      mode: modeKind,
      beat,
      pitfall,
      skipped: false,
      answer: answer.trim(),
    });
    next();
  }, [answer, current, submitting, modeKind, beat, pitfall, next, recordAnswer]);

  const onNext = useCallback(() => {
    if (!current || submitting) return;
    recordAnswer({
      itemId: current.id,
      mode: modeKind,
      beat,
      pitfall,
      skipped: true,
    });
    next();
  }, [current, submitting, recordAnswer, modeKind, beat, pitfall, next]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if (isEditableTarget(event.target)) return;
      const key = event.key.toLowerCase();
      if (key === "s") {
        event.preventDefault();
        onSkip();
      } else if (key === "c") {
        event.preventDefault();
        onComplete();
      } else if (key === "n") {
        event.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSkip, onComplete, onNext]);

  useEffect(() => {
    if (!finished || submitting || queue.length === 0 || hasSubmitted) return;
    let cancelled = false;
    const run = async () => {
      try {
        setSubmitting(true);
        setSubmitError(null);
        setHasSubmitted(true);
        const payload: SubmitPayload = {
          mode: modeName,
          beat,
          pitfall,
          items: answers,
          startedAt,
          finishedAt: new Date().toISOString(),
        };
        const response = await submitRound(payload);
        if (cancelled) return;
        const summary: RoundSummary = {
          completed: answers.filter((entry) => !entry.skipped).length,
          skipped: answers.filter((entry) => entry.skipped).length,
        };
        onDone({
          score: response.score,
          notes: response.rubric?.notes ?? [],
          id: response.id,
          summary,
          payload,
          response,
        });
      } catch (err) {
        if (cancelled) return;
        const message = (err as Error).message || "Failed to submit round";
        setSubmitError(message);
        onSubmitError?.(message);
      } finally {
        if (!cancelled) {
          setSubmitting(false);
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [finished, submitting, queue.length, hasSubmitted, modeName, beat, pitfall, answers, startedAt, onDone, onSubmitError]);

  const handleRetrySubmit = useCallback(() => {
    if (!finished) return;
    setSubmitError(null);
    setHasSubmitted(false);
  }, [finished]);

  if (loading) {
    return (
      <div className="card" data-testid="cutgames-round-loading">
        loading practice…
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-rose-200" data-testid="cutgames-round-error">
        {error}
      </div>
    );
  }

  if (!queue.length) {
    return (
      <div className="card" data-testid="cutgames-round-empty">
        no practice available
      </div>
    );
  }

  if (submitError) {
    return (
      <div className="card space-y-3 text-rose-200" data-testid="cutgames-round-submit-error">
        <p>{submitError}</p>
        <button type="button" className="btn btn-primary" onClick={handleRetrySubmit}>
          Try submitting again
        </button>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="card" data-testid="cutgames-round-scoring">
        scoring…
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="cutgames-round-engine">
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip is-on">{modeName}</span>
          {beat && <span className="chip">beat: {beat}</span>}
          {pitfall && <span className="chip">pitfall: {pitfall}</span>}
        </div>
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span>
            <span className="kbd">S</span> Skip
          </span>
          <span>
            <span className="kbd">C</span> Complete
          </span>
          <span>
            <span className="kbd">N</span> Next
          </span>
        </div>
      </div>

      <ProgressBar total={queue.length} index={idx} />

      {current && <SceneCard item={current} />}

      <div className="card space-y-3">
        <label className="block text-sm" htmlFor="cutgames-round-answer">
          Your move
        </label>
        <textarea
          id="cutgames-round-answer"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder={
            modeName === "Name"
              ? "Name the beat(s) present…"
              : modeName === "Missing"
                ? "What’s missing and why does it matter…"
                : modeName === "Fix"
                  ? "Rewrite or prescribe a fix…"
                  : modeName === "Order"
                    ? "Describe correct order / sequence…"
                    : modeName === "Highlight"
                      ? "Quote/mark the beat text and label it…"
                      : "Explain the purpose / effect of the beat…"
          }
          className="w-full min-h-40 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2"
          data-testid="cutgames-round-answer"
        />
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onSkip}
            data-testid="cutgames-round-skip"
            disabled={submitting}
          >
            Skip
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onComplete}
            data-testid="cutgames-round-complete"
            disabled={submitting}
          >
            Complete
          </button>
        </div>
      </div>
    </div>
  );
}
