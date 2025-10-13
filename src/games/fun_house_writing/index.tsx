import React from "react";
import { funhouseCatalog } from "./funhouse_catalog";
import { FunhousePrompt } from "./types";
import { TellEverythingShowNothing } from "./components/TellEverythingShowNothing";

const componentRegistry: Record<string, React.ComponentType<{ prompt: FunhousePrompt }>> = {
  TellEverythingShowNothing: ({ prompt }) => (
    <TellEverythingShowNothing promptText={prompt.prompt_text} />
  ),
};

export interface FunHouseWritingProps {
  promptId?: string;
}

export function FunHouseWriting(props: FunHouseWritingProps) {
  const { promptId } = props;
  const prompt = resolvePrompt(promptId);

  if (!prompt) {
    return (
      <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>Funhouse prompt not found</h2>
        <p style={{ color: "#555" }}>
          The requested Funhouse prompt either does not exist yet or is still being
          prototyped in the Funhouse lab.
        </p>
      </div>
    );
  }

  const Component = componentRegistry[prompt.ui_component];

  if (!Component) {
    return (
      <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>UI component missing</h2>
        <p style={{ color: "#555" }}>
          We have a prompt definition for this game, but the UI component
          <code style={{ marginLeft: 4 }}>{prompt.ui_component}</code> has not been
          wired up yet.
        </p>
      </div>
    );
  }

  return <Component prompt={prompt} />;
}

function resolvePrompt(promptId?: string): FunhousePrompt | undefined {
  if (promptId) {
    return funhouseCatalog.find((entry) => entry.id === promptId);
  }

  return funhouseCatalog[0];
}
