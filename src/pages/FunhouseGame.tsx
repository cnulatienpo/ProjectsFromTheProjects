import { useCallback, useEffect, useMemo, useState, type Dispatch, type JSX, type SetStateAction } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { CountdownTimer } from "@/components/CountdownTimer";
import { OneLineEditor } from "@/components/OneLineEditor";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { findFunhouseVariantById, funhousePrompts } from "@/data/funhouse-prompts";

import { GameLoader } from "@/games/fun_house_writing";
import { saveEntry } from "@/utils/funhouseStorage";

type PromptIndices = {
  promptIndex: number;
  variantIndex: number;
};

type ModeControls = {
  disableTextarea: Dispatch<SetStateAction<boolean>>;
  hideTextarea: Dispatch<SetStateAction<boolean>>;
};

const modeEngine: Record<string, (controls: ModeControls) => JSX.Element | null> = {
  "Beat Challenge": () => (
    <div className="space-y-2 rounded-xl border border-yellow-300/40 bg-yellow-100/10 p-3 text-sm text-yellow-100">
      <p className="text-xs uppercase tracking-[0.2em] text-yellow-200/80">Beat checklist</p>
      <label className="flex items-center gap-2">
        <input type="checkbox" className="h-4 w-4" />
        <span>Introduce a character</span>
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" className="h-4 w-4" />
        <span>Cause a change</span>
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" className="h-4 w-4" />
        <span>Add mystery</span>
      </label>
    </div>
  ),
  "Timed Rewrite": ({ disableTextarea }) => <TimedRewriteMode disableTextarea={disableTextarea} />,
  "One Line at a Time": ({ hideTextarea }) => <OneLineMode hideTextarea={hideTextarea} />,
};

function resolveIndices(id: string | undefined): PromptIndices {
  if (!id) {
    return { promptIndex: 0, variantIndex: 0 };
  }

  const match = findFunhouseVariantById(id);

  if (!match) {
    return { promptIndex: 0, variantIndex: 0 };
  }

  const promptIndex = funhousePrompts.findIndex((prompt) => prompt.id === match.prompt.id);
  const variantIndex = match.prompt.variants.findIndex((variant) => variant.id === match.variant.id);

  return {
    promptIndex: promptIndex >= 0 ? promptIndex : 0,
    variantIndex: variantIndex >= 0 ? variantIndex : 0,
  };
}

export default function FunhouseGame(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const initialIndices = useMemo(() => resolveIndices(id), [id]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(initialIndices.promptIndex);
  const [variantIndex, setVariantIndex] = useState(initialIndices.variantIndex);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [isFlashMode, setIsFlashMode] = useState(false);
  const [isTextareaDisabled, setIsTextareaDisabled] = useState(false);
  const [isTextareaHidden, setIsTextareaHidden] = useState(false);
  const [userText, setUserText] = useState("");

  const currentPrompt = funhousePrompts[currentPromptIndex];
  const currentVariant = currentPrompt?.variants[variantIndex];
  const replayText =
    typeof location.state === "object" && location.state !== null
      ? (location.state as { replayText?: string }).replayText
      : undefined;

  useEffect(() => {
    const next = resolveIndices(id);
    setCurrentPromptIndex(next.promptIndex);
    setVariantIndex(next.variantIndex);
  }, [id]);

  useEffect(() => {
    if (replayText !== undefined) {
      setUserText(replayText);
      return;
    }

    setUserText("");
  }, [currentVariant?.id, replayText]);

  useEffect(() => {
    setIsTextareaDisabled(false);
    setIsTextareaHidden(false);
  }, [currentVariant?.id]);

  const activateVariant = useCallback(
    (nextPromptIndex: number, nextVariantIndex: number) => {
      if (funhousePrompts.length === 0) {
        return;
      }

      const boundedPromptIndex = ((nextPromptIndex % funhousePrompts.length) + funhousePrompts.length) % funhousePrompts.length;
      const prompt = funhousePrompts[boundedPromptIndex];

      if (!prompt || prompt.variants.length === 0) {
        return;
      }

      const boundedVariantIndex = ((nextVariantIndex % prompt.variants.length) + prompt.variants.length) % prompt.variants.length;
      const selectedVariant = prompt.variants[boundedVariantIndex];

      setCurrentPromptIndex(boundedPromptIndex);
      setVariantIndex(boundedVariantIndex);

      if (selectedVariant?.id && selectedVariant.id !== id) {
        navigate(`/funhouse/${selectedVariant.id}`);
      }
    },
    [id, navigate]
  );

  const handleNewGame = useCallback(() => {
    activateVariant(currentPromptIndex + 1, 0);
  }, [activateVariant, currentPromptIndex]);

  const handleNextVariant = useCallback(() => {
    if (!currentPrompt) {
      return;
    }

    activateVariant(currentPromptIndex, variantIndex + 1);
  }, [activateVariant, currentPrompt, currentPromptIndex, variantIndex]);

  const randomPrompt = useCallback(() => {
    if (funhousePrompts.length === 0) {
      return;
    }

    if (funhousePrompts.length === 1 && funhousePrompts[0]?.variants.length <= 1) {
      return;
    }

    let newPromptIndex = currentPromptIndex;
    let newVariantIndex = variantIndex;
    const currentVariantId = currentVariant?.id ?? null;

    for (let attempts = 0; attempts < 12; attempts += 1) {
      newPromptIndex = Math.floor(Math.random() * funhousePrompts.length);
      const variants = funhousePrompts[newPromptIndex]?.variants ?? [];

      if (variants.length === 0) {
        continue;
      }

      newVariantIndex = Math.floor(Math.random() * variants.length);

      if (variants[newVariantIndex]?.id !== currentVariantId) {
        break;
      }

      if (attempts === 11) {
        const fallbackPromptIndex = (currentPromptIndex + 1) % funhousePrompts.length;
        const fallbackVariants = funhousePrompts[fallbackPromptIndex]?.variants ?? [];

        newPromptIndex = fallbackPromptIndex;
        newVariantIndex = fallbackVariants.length > 0 ? 0 : variantIndex;
      }
    }

    setIsRandomizing(true);
    setIsFlashMode(true);

    window.setTimeout(() => setIsRandomizing(false), 320);
    window.setTimeout(() => setIsFlashMode(false), 120);

    navigator.vibrate?.(80);

    activateVariant(newPromptIndex, newVariantIndex);
  }, [activateVariant, currentPromptIndex, currentVariant?.id, variantIndex]);

  if (!id && !currentVariant) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 p-6 text-center">
        <p className="text-lg font-semibold">No Funhouse game selected.</p>
        <Link
          to="/funhouse"
          className="mx-auto inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Browse Funhouse variants
        </Link>
      </div>
    );
  }

  const chaosContainerClass = isFlashMode
    ? "bg-yellow-200/30 ring-4 ring-yellow-300 transition"
    : "transition";

  const handleSave = useCallback(() => {
    if (!currentPrompt || !currentVariant) {
      return;
    }

    saveEntry({
      id: currentVariant.id,
      variant: currentVariant.mode,
      title: currentPrompt.title,
      text: userText,
      timestamp: Date.now(),
    });

    if (typeof window !== "undefined") {
      window.alert("Disaster preserved!");
    }
  }, [currentPrompt, currentVariant, userText]);

  return (
    <div className={`mx-auto w-full max-w-5xl space-y-6 p-4 ${chaosContainerClass}`}>
      {currentPrompt && currentVariant ? (
        <section className="rounded-3xl border border-purple-500/40 bg-gradient-to-br from-purple-950/70 via-neutral-950/60 to-orange-900/40 p-6 shadow-[6px_6px_0_rgba(168,85,247,0.45)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-baseline gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-200">
                  {currentPrompt.source} funhouse remix
                </p>
                <span className="rounded-full border border-purple-400/60 bg-purple-500/30 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-purple-100">
                  {currentVariant.mode}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white">{currentPrompt.title}</h1>
              <p className="text-sm text-purple-100/90">
                Original instructions: {currentPrompt.instructions}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Button onClick={handleNewGame} className="border-2 border-purple-300 bg-purple-100 text-purple-900 shadow-[2px_2px_0_rgba(147,51,234,0.45)] transition hover:translate-y-0.5">
                🎪 New Game
              </Button>
              <Button onClick={handleNextVariant} className="border-2 border-orange-300 bg-orange-100 text-orange-900 shadow-[2px_2px_0_rgba(249,115,22,0.45)] transition hover:translate-y-0.5">
                🔄 Next Variant
              </Button>
              <Button
                onClick={randomPrompt}
                className={`bg-yellow-300 text-black font-bold border-black border-2 shadow-[2px_2px_0_rgba(234,179,8,0.85)] transition hover:translate-y-0.5 ${
                  isRandomizing ? "animate-bounce" : ""
                }`}
              >
                🎲 Random Game
              </Button>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-orange-100">
            {currentVariant.instructions
              .split(/\n+/)
              .filter((line) => line.trim().length > 0)
              .map((line, index) => (
                <p
                  key={`${currentVariant.id}-${index}`}
                  className="rounded-xl border border-purple-400/30 bg-purple-950/50 px-3 py-2 text-left leading-relaxed shadow-inner shadow-orange-500/30"
                >
                  {line}
                </p>
              ))}
          </div>
          <div className="mt-6 space-y-3 rounded-2xl border border-purple-200/40 bg-black/20 p-4 shadow-[4px_4px_0_rgba(59,7,100,0.45)]">
            {renderModeLayer(currentVariant.mode, {
              disableTextarea: setIsTextareaDisabled,
              hideTextarea: setIsTextareaHidden,
            })}
            {!modeEngine[currentVariant.mode] ? (
              <p className="text-sm italic text-purple-100/70">Free Play mode</p>
            ) : null}
            {isTextareaHidden ? (
              <p className="rounded-xl border border-purple-300/30 bg-purple-950/50 p-3 text-sm text-purple-100/80">
                The main editor unlocks after your next line.
              </p>
            ) : (
              <Textarea
                value={userText}
                onChange={(event) => setUserText(event.target.value)}
                placeholder="Spew your weirdest prose right here."
                disabled={isTextareaDisabled}
                className="min-h-[200px] w-full border-2 border-purple-200 bg-purple-950/40 text-purple-50 shadow-[2px_2px_0_rgba(147,51,234,0.5)] focus-visible:border-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
              />
            )}
            {isTextareaDisabled ? (
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400/90">
                Timer expired — editing locked.
              </p>
            ) : null}
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-purple-200/80">
                Save your chaos to revisit in Past Mischief.
              </p>
              <Button
                onClick={handleSave}
                className="bg-black text-white border-2 border-white px-5 py-2 font-semibold tracking-wide shadow-[3px_3px_0_rgba(255,255,255,0.35)] transition hover:translate-y-0.5 hover:bg-white hover:text-black"
              >
                💾 Save This Disaster
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {currentVariant ? <GameLoader id={currentVariant.id} /> : null}
    </div>
  );
}

function renderModeLayer(mode: string, controls: ModeControls): JSX.Element | null {
  const renderer = modeEngine[mode];

  if (!renderer) {
    return null;
  }

  return renderer(controls);
}

function TimedRewriteMode({ disableTextarea }: { disableTextarea: ModeControls["disableTextarea"] }): JSX.Element {
  useEffect(() => {
    disableTextarea(false);

    return () => {
      disableTextarea(false);
    };
  }, [disableTextarea]);

  return (
    <div className="space-y-2 rounded-xl border border-purple-200/40 bg-purple-950/40 p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-purple-200/80">Timed rewrite</p>
      <CountdownTimer minutes={3} onExpire={() => disableTextarea(true)} />
      <p className="text-xs text-purple-100/70">When the clock strikes zero, the main editor locks.</p>
    </div>
  );
}

function OneLineMode({ hideTextarea }: { hideTextarea: ModeControls["hideTextarea"] }): JSX.Element {
  const handleHide = useCallback(() => {
    hideTextarea(true);
  }, [hideTextarea]);

  const handleReveal = useCallback(() => {
    hideTextarea(false);
  }, [hideTextarea]);

  return <OneLineEditor onHideTextarea={handleHide} onRevealTextarea={handleReveal} />;
}
