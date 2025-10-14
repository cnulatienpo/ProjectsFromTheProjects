import React, { useEffect, useMemo, useState } from "react";
import { funhouseCatalog } from "./funhouse_catalog";
import { FunhousePrompt } from "./types";

type DynamicComponent = React.ComponentType<{ prompt: FunhousePrompt }>;

type LoaderState =
  | { status: "idle" | "loading"; Component: null }
  | { status: "ready"; Component: DynamicComponent }
  | { status: "error"; Component: null };

export interface GameLoaderProps {
  id: string;
}

export function GameLoader({ id }: GameLoaderProps) {
  const game = useMemo(() => funhouseCatalog.find((entry) => entry.id === id), [id]);
  const [state, setState] = useState<LoaderState>(() =>
    game ? { status: "loading", Component: null } : { status: "idle", Component: null }
  );

  useEffect(() => {
    if (!game) {
      setState({ status: "idle", Component: null });
      return;
    }

    let isActive = true;
    setState({ status: "loading", Component: null });

    import(/* @vite-ignore */ `./components/${game.ui_component}`)
      .then((module) => {
        if (!isActive) {
          return;
        }

        const ImportedComponent = (module.default ?? module[game.ui_component]) as
          | DynamicComponent
          | undefined;

        if (ImportedComponent) {
          setState({ status: "ready", Component: ImportedComponent });
        } else {
          setState({ status: "error", Component: null });
        }
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setState({ status: "error", Component: null });
      });

    return () => {
      isActive = false;
    };
  }, [game]);

  if (!game) {
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
        <p style={{ marginBottom: "1rem" }}>Game not found.</p>
        <button
          type="button"
          onClick={() => {
            // TODO: Wire up navigation to the Funhouse menu when available.
          }}
          style={{
            backgroundColor: "#4f46e5",
            border: "none",
            borderRadius: "0.5rem",
            color: "white",
            cursor: "pointer",
            padding: "0.75rem 1.5rem",
          }}
        >
          Back to Funhouse Menu
        </button>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
        <p>Loading Funhouse interface…</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
        <p>This Funhouse game doesn't have an interface yet.</p>
      </div>
    );
  }

  if (state.status === "ready" && state.Component) {
    const LoadedComponent = state.Component;
    return <LoadedComponent prompt={game} />;
  }

  return null;
}
