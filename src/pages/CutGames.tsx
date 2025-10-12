import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import BeatPitfallPicker from "../components/cutgames/BeatPitfallPicker";
import {
  CatalogBeat,
  CatalogMode,
  CutGamesCatalog,
  IntroductionsIndex,
  PracticeItem,
  PracticeMode,
  RoundItemAnswer,
  RoundMode,
  SubmitRoundResponse,
  fetchBeats,
  fetchCatalog,
  fetchIntroductions,
  fetchPractice,
  sendTelemetrySkip,
  submitRound,
} from "../lib/cutGamesClient";
import "../styles/cutgames.css";

const ROUND_SIZE = 5;

type RoundSelection = {
  datasetMode: PracticeMode;
  gameMode: RoundMode;
  beat?: string;
  pitfall?: string;
};

type RoundAnswerState = Record<number, { answer: string; skipped: boolean }>;

type NormalizedRoundResult = {
  id?: string;
  score: number;
  rubricScore?: number;
  notes: string[];
  flags?: Record<string, unknown>;
  xp?: number;
  level?: number;
  newBadges?: SubmitRoundResponse["newBadges"];
  raw: SubmitRoundResponse;
};

type RoundState = {
  selection: RoundSelection;
  items: PracticeItem[];
  answers: RoundAnswerState;
  currentIndex: number;
  startedAt: string;
  finishedAt?: string;
  submitting: boolean;
  submitError?: string;
  result?: NormalizedRoundResult | null;
};

const isFormElement = (target: EventTarget | null): target is HTMLElement => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || target.isContentEditable;
};

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const formatKey = (value?: string | null) => {
  if (!value) return "";
  return value
    .split(/[_-]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const normalizeSubmitResponse = (response: SubmitRoundResponse): NormalizedRoundResult => ({
  id: response.id,
  score: typeof response.score === "number" ? response.score : response.rubric?.score ?? 0,
  rubricScore: response.rubric?.score,
  notes: Array.isArray(response.rubric?.notes) ? response.rubric.notes : [],
  flags: response.rubric?.flags,
  xp: response.xp,
  level: response.level,
  newBadges: response.newBadges,
  raw: response,
});

const describeBeat = (beat?: string | null) => (beat ? formatKey(beat) : "Any beat");
const describePitfall = (pitfall?: string | null) => (pitfall ? formatKey(pitfall) : "Any pitfall");

const KeyboardLegend = () => (
  <ul className="flex flex-wrap gap-3" data-testid="cutgames-hotkeys">
    {[
      { key: "R", label: "Start Round" },
      { key: "S", label: "Skip" },
      { key: "C", label: "Complete" },
      { key: "N", label: "Next" },
    ].map(({ key, label }) => (
      <li key={key} className="inline-flex items-center gap-2 text-sm text-neutral-300">
        <span className="kbd">{key}</span>
        <span>{label}</span>
      </li>
    ))}
  </ul>
);

function useMetaBundles() {
  const [catalog, setCatalog] = useState<CutGamesCatalog | null>(null);
  const [beats, setBeats] = useState<CatalogBeat[]>([]);
  const [introductions, setIntroductions] = useState<IntroductionsIndex>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const [cat, beatRows, introIndex] = await Promise.all([
          fetchCatalog(),
          fetchBeats(),
          fetchIntroductions(),
        ]);
        if (cancelled) return;
        setCatalog(cat);
        setBeats(Array.isArray(beatRows) ? beatRows : []);
        setIntroductions(introIndex ?? {});
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message || "Failed to load Cut Games data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { catalog, beats, introductions, loading, error } as const;
}

function buildInitialAnswers(items: PracticeItem[]): RoundAnswerState {
  const base: RoundAnswerState = {};
  for (const item of items) {
    const id = Number(item.id);
    base[id] = { answer: "", skipped: false };
  }
  return base;
}

function useKeyboardShortcuts(
  round: RoundState | null,
  onStart: () => void,
  onSkip: () => void,
  onComplete: () => void,
  onNext: () => void,
) {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if (isFormElement(event.target)) return;
      const key = event.key.toLowerCase();

      if (!round || round.result) {
        if (key === "r") {
          event.preventDefault();
          onStart();
        }
        return;
      }

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

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [round, onStart, onSkip, onComplete, onNext]);
}

export default function CutGames() {
  const { catalog, beats, introductions, loading, error } = useMetaBundles();
  const [selection, setSelection] = useState<RoundSelection>({ datasetMode: "bad", gameMode: "Name" });
  const [round, setRound] = useState<RoundState | null>(null);
  const [roundError, setRoundError] = useState<string | null>(null);
  const [roundLoading, setRoundLoading] = useState(false);

  useEffect(() => {
    if (!catalog) return;
    setSelection((prev) => {
      const modes = catalog.modes ?? [];
      const hasPrev = modes.some((mode) => mode.name === prev.gameMode);
      const fallback = (modes[0]?.name as RoundMode | undefined) ?? prev.gameMode;
      if (hasPrev) return prev;
      return { ...prev, gameMode: fallback ?? "Name" };
    });
  }, [catalog]);

  const activeMode: CatalogMode | undefined = useMemo(() => {
    if (!catalog) return undefined;
    return catalog.modes?.find((mode) => mode.name === selection.gameMode);
  }, [catalog, selection.gameMode]);

  const beatOptions = useMemo(() => {
    if (!Array.isArray(beats)) return [] as CatalogBeat[];
    return beats.slice().sort((a, b) => b.total - a.total);
  }, [beats]);

  const currentItem = round ? round.items[round.currentIndex] : null;
  const currentAnswer = useMemo(() => {
    if (!round || !currentItem) return "";
    return round.answers[Number(currentItem.id)]?.answer ?? "";
  }, [round, currentItem]);

  const answeredCount = round
    ? round.items.filter((item) => {
        const entry = round.answers[Number(item.id)];
        if (!entry) return false;
        return entry.skipped || entry.answer.trim().length > 0;
      }).length
    : 0;

  const skipCount = round
    ? round.items.filter((item) => round.answers[Number(item.id)]?.skipped).length
    : 0;

  const handleStartRound = useCallback(async () => {
    if (roundLoading) return;
    setRoundError(null);
    setRoundLoading(true);
    try {
      const payloadBeat = selection.beat?.trim() || undefined;
      const payloadPitfall = selection.datasetMode === "bad" ? selection.pitfall?.trim() || undefined : undefined;
      const items = await fetchPractice({
        mode: selection.datasetMode,
        beat: payloadBeat,
        pitfall: payloadPitfall,
      });
      const trimmed = (items ?? []).slice(0, ROUND_SIZE);
      if (!trimmed.length) {
        throw new Error("No practice scenes available for this selection.");
      }
      const startedAt = new Date().toISOString();
      setRound({
        selection: { ...selection, beat: payloadBeat, pitfall: payloadPitfall },
        items: trimmed,
        answers: buildInitialAnswers(trimmed),
        currentIndex: 0,
        startedAt,
        submitting: false,
        result: null,
      });
    } catch (err) {
      setRound(null);
      setRoundError((err as Error).message || "Unable to start round");
    } finally {
      setRoundLoading(false);
    }
  }, [roundLoading, selection]);

  const handleAnswerChange = useCallback(
    (value: string) => {
      if (!round || !currentItem || round.result) return;
      const itemId = Number(currentItem.id);
      setRound((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          answers: {
            ...prev.answers,
            [itemId]: { answer: value, skipped: false },
          },
        };
      });
    },
    [round, currentItem]
  );

  const advanceIndex = useCallback(
    (offset: number) => {
      setRound((prev) => {
        if (!prev) return prev;
        const nextIndex = Math.max(0, Math.min(prev.items.length - 1, prev.currentIndex + offset));
        return { ...prev, currentIndex: nextIndex };
      });
    },
    []
  );

  const handleSkip = useCallback(async () => {
    if (!round || !currentItem || round.result) return;
    const itemId = Number(currentItem.id);
    const selectionMode = round.selection.datasetMode;
    setRound((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [itemId]: { answer: "", skipped: true },
        },
      };
    });
    try {
      await sendTelemetrySkip(selectionMode, {
        beat: currentItem.beat ?? undefined,
        pitfall: currentItem.pitfall ?? undefined,
        type: currentItem.type ?? undefined,
      });
    } catch (err) {
      console.warn("Failed to record skip", err);
    }
    if (round.currentIndex < round.items.length - 1) {
      advanceIndex(1);
    }
  }, [round, currentItem, advanceIndex]);

  const handleComplete = useCallback(() => {
    if (!round || !currentItem || round.result) return;
    if (!round.answers[Number(currentItem.id)]?.answer.trim()) return;
    if (round.currentIndex < round.items.length - 1) {
      advanceIndex(1);
    }
  }, [round, currentItem, advanceIndex]);

  const handleNext = useCallback(() => {
    if (!round) return;
    if (round.currentIndex < round.items.length - 1) {
      advanceIndex(1);
    }
  }, [round, advanceIndex]);

  const handlePrev = useCallback(() => {
    if (!round) return;
    if (round.currentIndex > 0) {
      advanceIndex(-1);
    }
  }, [round, advanceIndex]);

  const handleSubmitRound = useCallback(async () => {
    if (!round || round.result) return;
    setRound((prev) => (prev ? { ...prev, submitting: true, submitError: undefined } : prev));
    const finishedAt = new Date().toISOString();
    try {
      const itemsPayload: RoundItemAnswer[] = round.items.map((item) => {
        const entry = round.answers[Number(item.id)] ?? { answer: "", skipped: false };
        return {
          itemId: Number(item.id),
          mode: round.selection.datasetMode,
          beat: item.beat ?? undefined,
          pitfall: item.pitfall ?? undefined,
          answer: entry.answer || undefined,
          skipped: entry.skipped,
        };
      });
      const response = await submitRound({
        mode: round.selection.gameMode,
        beat: round.selection.beat,
        pitfall: round.selection.pitfall,
        items: itemsPayload,
        startedAt: round.startedAt,
        finishedAt,
      });
      setRound((prev) =>
        prev
          ? {
              ...prev,
              finishedAt,
              submitting: false,
              result: normalizeSubmitResponse(response),
            }
          : prev
      );
    } catch (err) {
      setRound((prev) =>
        prev
          ? {
              ...prev,
              submitting: false,
              submitError: (err as Error).message || "Failed to submit round",
            }
          : prev
      );
    }
  }, [round]);

  const resetRound = useCallback(() => {
    setRound(null);
    setRoundError(null);
  }, []);

  useKeyboardShortcuts(round, handleStartRound, handleSkip, handleComplete, handleNext);

  const introductionCount = useMemo(() => {
    if (!selection.beat) return 0;
    return introductions[selection.beat] ? introductions[selection.beat].length : 0;
  }, [introductions, selection.beat]);

  const roundReady = Boolean(round && !round.result);
  const showResults = Boolean(round?.result);
  const roundLocked = Boolean(round?.result);
  const startLabel = roundLoading
    ? "Preparing scenes…"
    : roundLocked
      ? "Start new round"
      : roundReady
        ? "Restart round"
        : "Start round";

  return (
    <div className="cut-shell" data-testid="cutgames-shell">
      <div className="cut-container space-y-6">
        <header className="card space-y-4" data-testid="cutgames-header-card">
          <div className="flex flex-col gap-2">
            <p className="text-sm uppercase tracking-[0.4em] text-neutral-400">Precision Story Lab</p>
            <h1 className="text-3xl font-semibold text-neutral-50">Cut Games Arena</h1>
            <p className="text-neutral-300">
              Draft, diagnose, and remix story beats. Choose a deck, play a round, and study the style report to sharpen your cut instincts.
            </p>
          </div>
          <KeyboardLegend />
        </header>

        {loading ? (
          <div className="card" data-testid="cutgames-loading">
            <p className="text-neutral-300">Loading cut game bundles…</p>
          </div>
        ) : error ? (
          <div className="card border-rose-500/60" data-testid="cutgames-error">
            <p className="text-rose-200">{error}</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <div className="space-y-6">
              <aside className="card space-y-5" data-testid="cutgames-setup">
                <section>
                  <h2 className="flex items-center justify-between text-neutral-100">
                    Round setup
                    <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">{ROUND_SIZE} scenes</span>
                  </h2>
                  <p className="mt-1 text-sm text-neutral-400">
                    {activeMode ? activeMode.desc : "Select a deck and mode to get started."}
                  </p>
                </section>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-200" htmlFor="cutgames-mode-select">
                      Game mode
                    </label>
                    <div className="flex flex-wrap gap-2" id="cutgames-mode-select">
                      {(catalog?.modes ?? []).map((mode) => {
                        const isActive = mode.name === selection.gameMode;
                        return (
                          <button
                            key={mode.name}
                            type="button"
                            className={clsx("chip transition", isActive && "is-on")}
                            onClick={() => setSelection((prev) => ({ ...prev, gameMode: mode.name }))}
                            data-testid={`cutgames-mode-${slugify(mode.name)}`}
                          >
                            {mode.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium text-neutral-200">Scene quality</span>
                    <div className="flex gap-2">
                      {(
                        [
                          { value: "good", label: "Good (mentor cuts)" },
                          { value: "bad", label: "Bad (fix-it lab)" },
                        ] as const
                      ).map((option) => {
                        const isActive = selection.datasetMode === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            className={clsx("chip transition", isActive && "is-on")}
                            onClick={() =>
                              setSelection((prev) => ({
                                ...prev,
                                datasetMode: option.value,
                                pitfall: option.value === "bad" ? prev.pitfall : undefined,
                              }))
                            }
                            data-testid={`cutgames-quality-${option.value}`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    className={clsx("btn w-full justify-center", "btn-primary", roundLoading && "opacity-70")}
                    onClick={handleStartRound}
                    disabled={roundLoading}
                    data-testid="cutgames-start-round"
                  >
                    {startLabel}
                  </button>
                  {round && !round.result && (
                    <button
                      type="button"
                      className="btn btn-ghost w-full justify-center text-neutral-300"
                      onClick={resetRound}
                      data-testid="cutgames-reset-round"
                    >
                      Cancel round
                    </button>
                  )}
                  {roundError && <p className="text-sm text-rose-300" data-testid="cutgames-round-error">{roundError}</p>}
                </div>

                {catalog && (
                  <dl className="grid grid-cols-2 gap-3 text-sm text-neutral-300" data-testid="cutgames-stats">
                    <div>
                      <dt className="text-neutral-500">Good scenes</dt>
                      <dd className="text-lg font-semibold text-neutral-100">{catalog.goodCount}</dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">Bad scenes</dt>
                      <dd className="text-lg font-semibold text-neutral-100">{catalog.badCount}</dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">Tweetrunk</dt>
                      <dd className="text-lg font-semibold text-neutral-100">{catalog.tweetrunkCount}</dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">Lesson tags</dt>
                      <dd className="text-lg font-semibold text-neutral-100">{catalog.lessonsByTagCount}</dd>
                    </div>
                  </dl>
                )}
              </aside>

              <BeatPitfallPicker
                beat={selection.beat}
                pitfall={selection.datasetMode === "bad" ? selection.pitfall : undefined}
                pitfallDisabled={selection.datasetMode !== "bad"}
                introductionCount={introductionCount}
                initialBeats={beatOptions}
                onChange={({ beat: nextBeat, pitfall: nextPitfall }) =>
                  setSelection((prev) => ({
                    ...prev,
                    beat: nextBeat,
                    pitfall: prev.datasetMode === "bad" ? nextPitfall : undefined,
                  }))
                }
              />
            </div>

            <main className="space-y-6" data-testid="cutgames-main-panel">
              {round ? (
                <section className="card space-y-4" data-testid="cutgames-round-card">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-neutral-100">Round in progress</h2>
                      <p className="text-sm text-neutral-400">
                        {describeBeat(round.selection.beat)} · {round.selection.datasetMode === "bad" ? describePitfall(round.selection.pitfall) : "Celebrate strong cuts"}
                      </p>
                    </div>
                    <div className="text-sm text-neutral-300" data-testid="cutgames-round-progress-text">
                      {answeredCount}/{round.items.length} complete · {skipCount} skipped
                    </div>
                  </div>

                  <div className="progress-track" data-testid="cutgames-progress">
                    <div
                      className="progress-bar"
                      style={{ width: `${Math.max(1, Math.round(((round.currentIndex + 1) / round.items.length) * 100))}%` }}
                    />
                  </div>

                  <article className="space-y-4 rounded-2xl bg-neutral-900/60 p-5" data-testid={`cutgames-scene-${currentItem?.id ?? "none"}`}>
                    <header className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-sm text-neutral-400">
                        Scene #{currentItem?.id ?? "?"}
                        {currentItem?.beat && (
                          <span className="ml-2 inline-flex items-center rounded-full border border-neutral-700 px-2 py-1 text-xs uppercase tracking-wide text-neutral-300">
                            {formatKey(currentItem.beat)}
                          </span>
                        )}
                        {currentItem?.pitfall && (
                          <span className="ml-2 inline-flex items-center rounded-full border border-rose-700/60 px-2 py-1 text-xs uppercase tracking-wide text-rose-200">
                            {formatKey(currentItem.pitfall)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <button type="button" className="btn btn-ghost px-3 py-1 text-xs" onClick={handlePrev} disabled={round.currentIndex === 0} data-testid="cutgames-prev-button">
                          Prev
                        </button>
                        <span>
                          {round.currentIndex + 1} / {round.items.length}
                        </span>
                        <button
                          type="button"
                          className="btn btn-ghost px-3 py-1 text-xs"
                          onClick={handleNext}
                          disabled={round.currentIndex >= round.items.length - 1}
                          data-testid="cutgames-next-button"
                        >
                          Next
                        </button>
                      </div>
                    </header>
                    <div className="scene text-neutral-100" data-testid="cutgames-scene-text">
                      {currentItem?.scene ?? "Pick a round to see practice scenes."}
                    </div>
                  </article>

                  <div className="space-y-2" data-testid="cutgames-response-block">
                    <label htmlFor="cutgames-response" className="text-sm font-medium text-neutral-200">
                      Your response
                    </label>
                  <textarea
                    id="cutgames-response"
                    value={currentAnswer}
                    onChange={(event) => handleAnswerChange(event.target.value)}
                    rows={5}
                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-900/80 px-3 py-3 text-sm text-neutral-100 focus:border-neutral-400 focus:outline-none"
                    placeholder={
                      round.selection.datasetMode === "bad"
                        ? "Diagnose the pitfall and propose a fix."
                        : "Name the beat, praise what works, or extend the cut."
                    }
                    disabled={roundLocked}
                    data-testid="cutgames-response"
                  />
                  </div>

                  <div className="flex flex-wrap items-center gap-3" data-testid="cutgames-round-actions">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={handleSkip}
                      disabled={roundLocked}
                      data-testid="cutgames-skip-button"
                    >
                      Skip
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleComplete}
                      disabled={roundLocked || !currentAnswer.trim()}
                      data-testid="cutgames-complete-button"
                    >
                      Complete
                    </button>
                    <div className="ml-auto flex flex-wrap gap-2 text-xs text-neutral-500">
                      <span>Mode: {round.selection.gameMode}</span>
                      <span>Deck: {round.selection.datasetMode === "bad" ? "Fix Bad" : "Celebrate Good"}</span>
                    </div>
                  </div>

                  <footer className="flex flex-wrap items-center gap-3 pt-2" data-testid="cutgames-submit-row">
                    <button
                      type="button"
                      className="btn w-full justify-center md:w-auto"
                      onClick={handleSubmitRound}
                      disabled={round.submitting || roundLocked}
                      data-testid="cutgames-submit-button"
                    >
                      {round.submitting ? "Scoring…" : "Submit round"}
                    </button>
                    {round.submitError && <span className="text-sm text-rose-300">{round.submitError}</span>}
                  </footer>
                </section>
              ) : (
                <section className="card space-y-4" data-testid="cutgames-placeholder">
                  <h2 className="text-neutral-100">Ready when you are</h2>
                  <p className="text-neutral-300">
                    Build your round on the left, then press <span className="kbd">R</span> or the Start button. We'll queue up {ROUND_SIZE} scenes that match your filters.
                  </p>
                  <p className="text-sm text-neutral-500">
                    Skipping a scene teaches the shadow stack what to serve next. Complete a round to see your personalized style report.
                  </p>
                </section>
              )}

              {showResults && round?.result && (
                <section className="card space-y-4" data-testid="cutgames-results">
                  <header className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-neutral-100">Round results</h2>
                      <p className="text-sm text-neutral-400">
                        Score {round.result.score.toFixed(2)} · Rubric {round.result.rubricScore ?? "—"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        resetRound();
                        void handleStartRound();
                      }}
                      data-testid="cutgames-play-again"
                    >
                      Play again
                    </button>
                  </header>

                  <div className="rounded-2xl border border-neutral-700 bg-neutral-900/60 p-5" data-testid="cutgames-style-report">
                    <h3 className="text-lg font-semibold text-neutral-100">Style report</h3>
                    {round.result.notes.length ? (
                      <ul className="mt-3 space-y-2 text-sm text-neutral-300" data-testid="cutgames-style-notes">
                        {round.result.notes.map((note, index) => (
                          <li key={`note-${index}`} className="rounded-xl bg-neutral-900/80 px-3 py-2">
                            {note}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-neutral-400">No style notes this time—clean cut!</p>
                    )}
                  </div>

                  <dl className="grid gap-4 text-sm text-neutral-300" data-testid="cutgames-results-meta">
                    <div>
                      <dt className="text-neutral-500">Deck</dt>
                      <dd>{round.selection.datasetMode === "bad" ? "Bad scenes lab" : "Good scenes celebration"}</dd>
                    </div>
                    {round.selection.beat && (
                      <div>
                        <dt className="text-neutral-500">Beat focus</dt>
                        <dd>{formatKey(round.selection.beat)}</dd>
                      </div>
                    )}
                    {round.selection.pitfall && (
                      <div>
                        <dt className="text-neutral-500">Pitfall focus</dt>
                        <dd>{formatKey(round.selection.pitfall)}</dd>
                      </div>
                    )}
                    {round.result.level && (
                      <div>
                        <dt className="text-neutral-500">Level</dt>
                        <dd>{round.result.level}</dd>
                      </div>
                    )}
                    {round.result.xp && (
                      <div>
                        <dt className="text-neutral-500">XP total</dt>
                        <dd>{round.result.xp}</dd>
                      </div>
                    )}
                  </dl>

                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4" data-testid="cutgames-round-recap">
                    <h3 className="text-sm font-semibold text-neutral-200">Round recap</h3>
                    <ul className="mt-3 space-y-2 text-sm text-neutral-400">
                      {round.items.map((item) => {
                        const entry = round.answers[Number(item.id)];
                        const status = entry?.skipped
                          ? "Skipped"
                          : entry && entry.answer.trim().length > 0
                          ? "Completed"
                          : "Unanswered";
                        return (
                          <li key={`recap-${item.id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-neutral-900/60 px-3 py-2">
                            <div>
                              <span className="text-neutral-200">#{item.id}</span>
                              {item.beat && <span className="ml-2 text-neutral-400">{formatKey(item.beat)}</span>}
                            </div>
                            <span className={clsx("text-xs font-semibold", status === "Skipped" ? "text-rose-300" : status === "Completed" ? "text-emerald-300" : "text-neutral-500")}>{status}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </section>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
