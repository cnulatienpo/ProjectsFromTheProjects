import React from "react";
import { FunhousePrompt } from "../types";

interface BeatComboMachineProps {
  prompt: FunhousePrompt;
}

const BeatComboMachine: React.FC<BeatComboMachineProps> = ({ prompt }) => {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{prompt.title}</h1>
      <p style={{ marginBottom: "2rem", color: "#4b5563" }}>{prompt.description}</p>
      <div
        style={{
          border: "2px dashed #9ca3af",
          borderRadius: "0.75rem",
          padding: "3rem 1.5rem",
          textAlign: "center",
          fontSize: "1.125rem",
          color: "#6b7280",
        }}
      >
        Beat Arcade goes here.
      </div>
    </div>
  );
};

export default BeatComboMachine;
