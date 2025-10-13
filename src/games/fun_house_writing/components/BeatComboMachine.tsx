import React from "react";
import { FunhousePrompt } from "../types";

interface BeatComboMachineProps {
  prompt: FunhousePrompt;
}

const beats = [
  "Thesis Drop",
  "Conflict Crunch",
  "Twist Spin",
  "Resolution Smash",
  "Aftershock Echo",
];

const BeatComboMachine: React.FC<BeatComboMachineProps> = ({ prompt }) => {
  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        padding: "2rem",
        color: "#0f172a",
        background: "linear-gradient(160deg, #fbcfe8, #c4b5fd)",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{prompt.title}</h1>
      <p style={{ maxWidth: 720, lineHeight: 1.6, marginBottom: "2rem" }}>{prompt.description}</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          maxWidth: 900,
        }}
      >
        {beats.map((beat) => (
          <div
            key={beat}
            style={{
              background: "rgba(15, 23, 42, 0.9)",
              color: "white",
              borderRadius: "0.75rem",
              padding: "1rem",
              boxShadow: "0 15px 35px rgba(15, 23, 42, 0.2)",
            }}
          >
            <h2 style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>{beat}</h2>
            <p style={{ lineHeight: 1.5, fontSize: "0.95rem" }}>
              Spin this beat into your draft. Find the most chaotic way to hit the story note while
              keeping the rhythm alive.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BeatComboMachine;
