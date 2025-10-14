import React from "react";
import { FunhousePrompt } from "../types";

interface OneParagraphChallengeProps {
  prompt: FunhousePrompt;
}

const OneParagraphChallenge: React.FC<OneParagraphChallengeProps> = ({ prompt }) => {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 720 }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{prompt.title}</h1>
        <p style={{ color: "#475569", lineHeight: 1.5 }}>{prompt.description}</p>
      </header>
      <section style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Observation Log</h2>
        <p style={{ background: "#f1f5f9", padding: "1rem", borderRadius: "0.75rem", lineHeight: 1.6 }}>
          {prompt.prompt_text}
        </p>
      </section>
      <section style={{ background: "#e2e8f0", borderRadius: "0.75rem", padding: "1rem" }}>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          Draft ten bullet-point observations. Each one should feel like a strange snapshot of the story. Once you have them,
          stitch the list into a single paragraph that still reads like a catalog of oddities.
        </p>
      </section>
    </div>
  );
};

export default OneParagraphChallenge;
