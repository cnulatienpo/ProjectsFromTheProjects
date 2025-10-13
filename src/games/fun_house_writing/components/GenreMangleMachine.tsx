import React from "react";
import { FunhousePrompt } from "../types";

interface GenreMangleMachineProps {
  prompt: FunhousePrompt;
}

const GenreMangleMachine: React.FC<GenreMangleMachineProps> = ({ prompt }) => {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 720 }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{prompt.title}</h1>
        <p style={{ color: "#475569", lineHeight: 1.5 }}>{prompt.description}</p>
      </header>
      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Genre Remix Instructions</h2>
        <p style={{ background: "#fef3c7", padding: "1rem", borderRadius: "0.75rem", lineHeight: 1.6 }}>
          {prompt.prompt_text}
        </p>
      </section>
      <ol style={{ marginLeft: "1.5rem", color: "#334155", lineHeight: 1.6 }}>
        <li>List the hallmarks of the requested genre.</li>
        <li>Rewrite the original scene beats to highlight those genre traits.</li>
        <li>Keep the emotional core intact while the dressing gets weird.</li>
      </ol>
    </div>
  );
};

export default GenreMangleMachine;
