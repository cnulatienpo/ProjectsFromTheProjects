import React, { useEffect, useMemo, useState } from "react";
import { funhouseCatalog } from "./funhouse_catalog";
import {
  FunhouseComponentKey,
  FunhouseGameType,
  FunhousePrompt,
} from "./types";

type DynamicComponent = React.ComponentType<{ prompt: FunhousePrompt }>;

type LoaderState =
  | { status: "idle" | "loading"; component: null }
  | { status: "ready"; component: DynamicComponent }
  | { status: "error"; component: null };

const componentByGameType: Partial<Record<FunhouseGameType, FunhouseComponentKey>> = {
  writing_prompt: "FreeWriteTextBox",
  beat_arcade: "BeatComboMachine",
  style_swap: "VoiceImpersonatorChallenge",
};

export interface GameLoaderProps {
  id: string;
}

export function GameLoader({ id }: GameLoaderProps) {
  const prompt = useMemo(() => funhouseCatalog.find((entry) => entry.id === id), [id]);
  const [state, setState] = useState<LoaderState>(() =>
    prompt ? { status: "loading", component: null } : { status: "idle", component: null }
  );

  useEffect(() => {
    if (!prompt) {
      setState({ status: "idle", component: null });
      return;
    }

    setState({ status: "loading", component: null });

    const componentName = componentByGameType[prompt.game_type] ?? prompt.ui_component;
    let isActive = true;

    import(/* @vite-ignore */ `./components/${componentName}`)
      .then((module) => {
        if (!isActive) {
          return;
        }

        const ImportedComponent = (module.default ?? module[componentName]) as DynamicComponent | undefined;

        if (ImportedComponent) {
          setState({ status: "ready", component: ImportedComponent });
        } else {
          setState({ status: "error", component: null });
        }
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setState({ status: "error", component: null });
      });

    return () => {
      isActive = false;
    };
  }, [prompt]);

  if (!prompt) {
    return (
      <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>Funhouse prompt not found</h2>
        <p style={{ color: "#555" }}>
          The requested Funhouse prompt either does not exist yet or is still being prototyped in the Funhouse lab.
        </p>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
        <p>Loading Funhouse interface…</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
        <p>This Funhouse game doesn't have an interface yet.</p>
      </div>
    );
  }

  if (state.status === "ready" && state.component) {
    const LoadedComponent = state.component;
    return <LoadedComponent prompt={prompt} />;
  }

  return null;
}
