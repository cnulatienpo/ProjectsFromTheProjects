import { useCallback, useEffect, useMemo, useState, type JSX } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { findFunhouseVariantById, funhousePrompts } from "@/data/funhouse-prompts";

import { GameLoader } from "@/games/fun_house_writing";

type PromptIndices = {
  promptIndex: number;
  variantIndex: number;
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
  const initialIndices = useMemo(() => resolveIndices(id), [id]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(initialIndices.promptIndex);
  const [variantIndex, setVariantIndex] = useState(initialIndices.variantIndex);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [isFlashMode, setIsFlashMode] = useState(false);

  const currentPrompt = funhousePrompts[currentPromptIndex];
  const currentVariant = currentPrompt?.variants[variantIndex];

  useEffect(() => {
    const next = resolveIndices(id);
    setCurrentPromptIndex(next.promptIndex);
    setVariantIndex(next.variantIndex);
  }, [id]);

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
        </section>
      ) : null}

      {currentVariant ? <GameLoader id={currentVariant.id} /> : null}
    </div>
  );
}
