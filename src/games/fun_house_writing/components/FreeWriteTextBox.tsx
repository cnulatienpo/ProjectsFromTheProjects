import React, { useState } from "react";
import { FunhousePrompt } from "../types";

interface FreeWriteTextBoxProps {
  prompt: FunhousePrompt;
}

const FreeWriteTextBox: React.FC<FreeWriteTextBoxProps> = ({ prompt }) => {
  const [entry, setEntry] = useState("");

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 720 }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{prompt.title}</h1>
        <p style={{ color: "#555", lineHeight: 1.4 }}>{prompt.description}</p>
      </header>
      <section style={{ marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Prompt</h2>
        <p style={{ background: "#f7f5ff", padding: "1rem", borderRadius: "0.5rem", lineHeight: 1.5 }}>
          {prompt.prompt_text}
        </p>
      </section>
      <textarea
        aria-label="Funhouse free write"
        value={entry}
        onChange={(event) => setEntry(event.target.value)}
        style={{
          width: "100%",
          minHeight: "16rem",
          padding: "1rem",
          fontSize: "1rem",
          fontFamily: "'JetBrains Mono', monospace",
          lineHeight: 1.5,
          borderRadius: "0.5rem",
          border: "2px solid #c4b5fd",
          backgroundColor: "#fff",
          boxShadow: "0 10px 20px rgba(99, 102, 241, 0.1)",
        }}
        placeholder="Spew your most over-explained scene here."
      />
      <div style={{ marginTop: "0.75rem", color: "#666", fontSize: "0.875rem" }}>
        Word count: {entry.trim() === "" ? 0 : entry.trim().split(/\s+/).length}
      </div>
    </div>
  );
};

export default FreeWriteTextBox;
