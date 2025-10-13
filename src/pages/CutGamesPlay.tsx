import { useCallback, useEffect, useState } from "react";
import "../styles/cutgames.css";
import ModePicker from "../components/cutgames/ModePicker";
import BeatPitfallPicker from "../components/cutgames/BeatPitfallPicker";
import RoundEngine, { type RoundCompletion } from "../components/cutgames/RoundEngine";
import ResultsScreen from "../components/cutgames/ResultsScreen";

type ModeName = "Name" | "Missing" | "Fix" | "Order" | "Highlight" | "Why";

type Phase = "select" | "play" | "results";

export default function CutGamesPlay() {
  const [mode, setMode] = useState<ModeName>("Name");
  const [beat, setBeat] = useState<string | undefined>();
  const [pitfall, setPitfall] = useState<string | undefined>();
  const [roundKey, setRoundKey] = useState(0);
  const [phase, setPhase] = useState<Phase>("select");
  const [results, setResults] = useState<RoundCompletion | null>(null);

  const startRound = useCallback(() => {
    setPhase("play");
    setResults(null);
    setRoundKey((key) => key + 1);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (phase !== "select") return;
      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        startRound();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, startRound]);

  const handleDone = (roundResult: RoundCompletion) => {
    setResults(roundResult);
    setPhase("results");
  };

  return (
    <div className="cut-shell" data-testid="cut-games-root">
      <div className="cut-container space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Cut Games</h1>
          <div className="text-sm text-neutral-400">Projects From The Projects</div>
        </header>

        {phase === "select" && (
          <>
            <ModePicker value={mode} onChange={(next) => setMode(next as ModeName)} />
            <BeatPitfallPicker
              beat={beat}
              pitfall={pitfall}
              onChange={(next) => {
                setBeat(next.beat);
                setPitfall(next.pitfall);
              }}
            />
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={startRound} data-testid="btn-start">
                Start Round
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setBeat(undefined);
                  setPitfall(undefined);
                }}
              >
                Clear
              </button>
            </div>
            <div className="text-xs text-neutral-400">
              Pro-tip: press <span className="kbd">R</span> to start.
            </div>
          </>
        )}

        {phase === "play" && (
          <RoundEngine
            key={roundKey}
            modeName={mode}
            beat={beat}
            pitfall={pitfall}
            onDone={handleDone}
          />
        )}

        {phase === "results" && results && (
          <ResultsScreen
            score={results.score}
            notes={results.notes}
            summary={results.summary}
            payload={results.payload}
            onRestart={() => {
              setPhase("select");
            }}
          />
        )}
      </div>
    </div>
  );
}
