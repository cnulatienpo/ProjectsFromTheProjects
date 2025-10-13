import React from "react";
import { FunhousePrompt } from "../types";

interface VoiceSwapGameProps {
  prompt: FunhousePrompt;
}

const VoiceSwapGame: React.FC<VoiceSwapGameProps> = ({ prompt }) => {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 720 }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{prompt.title}</h1>
        <p style={{ color: "#4b5563", lineHeight: 1.5 }}>{prompt.description}</p>
      </header>
      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Voice Swap Challenge</h2>
        <p style={{ background: "#eef2ff", padding: "1rem", borderRadius: "0.75rem", lineHeight: 1.6 }}>
          {prompt.prompt_text}
        </p>
      </section>
      <div
        style={{
          background: "#1e293b",
          color: "#f8fafc",
          padding: "1rem 1.25rem",
          borderRadius: "0.75rem",
          lineHeight: 1.5,
        }}
      >
        Try narrating the scene directly to the reader. Keep the twist in mind and lean into how the storyteller’s tone shifts the
        experience.
      </div>
    </div>
  );
};

export default VoiceSwapGame;
