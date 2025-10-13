import React from "react";
import { FunhousePrompt } from "../types";

interface VoiceImpersonatorChallengeProps {
  prompt: FunhousePrompt;
}

const VoiceImpersonatorChallenge: React.FC<VoiceImpersonatorChallengeProps> = ({ prompt }) => {
  const voices = [
    "Gothic Ghost Blogger",
    "Hyper-earnest Motivational Speaker",
    "Deadpan Documentary Narrator",
    "Chaotic Goblin Poet",
  ];

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", backgroundColor: "#0f172a", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          background: "#fff",
          borderRadius: "1rem",
          padding: "2rem",
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.35)",
        }}
      >
        <h1 style={{ fontSize: "2.25rem", marginBottom: "0.75rem" }}>{prompt.title}</h1>
        <p style={{ color: "#475569", lineHeight: 1.6, marginBottom: "1.5rem" }}>{prompt.description}</p>
        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Prompt</h2>
          <p style={{ lineHeight: 1.6 }}>{prompt.prompt_text}</p>
        </section>
        <section>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Pick a voice to impersonate</h2>
          <ul style={{ listStyle: "disc", paddingLeft: "1.5rem", color: "#1e293b" }}>
            {voices.map((voice) => (
              <li key={voice} style={{ marginBottom: "0.5rem" }}>
                {voice}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default VoiceImpersonatorChallenge;
