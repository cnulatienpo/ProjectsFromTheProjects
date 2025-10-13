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
  return <div>✂️ Cut Games intro goes here</div>;
}
