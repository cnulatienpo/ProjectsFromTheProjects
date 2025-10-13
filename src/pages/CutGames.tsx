import React, { useState } from "react";

const samplePrompts = [
  "Cut 10 words from this paragraph.",
  "Replace every adjective with a stronger one.",
  "Find and remove passive voice.",
  "Edit for clarity: rewrite the sentence.",
];

export default function CutGames() {
  const [current, setCurrent] = useState(0);

  function nextPrompt() {
    setCurrent((c) => (c + 1) % samplePrompts.length);
  }

  return (
    <div style={{ maxWidth: 600, margin: "3rem auto", padding: "2rem", background: "#fff", borderRadius: "12px", border: "2px solid #222", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1.5rem", textAlign: "center" }}>
        The Cut Games
      </h1>
      <div style={{ fontSize: "1.2rem", marginBottom: "2rem", textAlign: "center" }}>
        {samplePrompts[current]}
      </div>
      <button
        style={{
          padding: "0.75rem 2rem",
          fontSize: "1rem",
          background: "#222",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          display: "block",
          margin: "0 auto"
        }}
        onClick={nextPrompt}
      >
        Next Challenge
      </button>
    </div>
  );
}
