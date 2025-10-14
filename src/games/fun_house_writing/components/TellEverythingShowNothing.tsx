import React from "react";

interface TellEverythingShowNothingProps {
  promptText: string;
}

export function TellEverythingShowNothing(props: TellEverythingShowNothingProps) {
  const { promptText } = props;

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        maxWidth: 720,
        margin: "0 auto",
        padding: "2rem 1.5rem",
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
      }}
    >
      <header>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
          Tell Everything, Show Nothing
        </h1>
        <p style={{ color: "#555", lineHeight: 1.6 }}>
          This Funhouse remix challenges writers to deliberately over-explain every
          feeling, intention, and movement. Lean into exposition. Spell out every
          motivation. The more literal the better.
        </p>
      </header>
      <article
        style={{
          background: "#f8f5ff",
          border: "1px solid #d9cff9",
          borderRadius: "12px",
          padding: "1.5rem",
          lineHeight: 1.7,
          color: "#2c2452",
          boxShadow: "0 12px 32px -24px rgba(61, 35, 125, 0.6)",
        }}
      >
        <strong style={{ display: "block", marginBottom: "0.75rem" }}>
          Prompt
        </strong>
        <p>{promptText}</p>
      </article>
      <footer style={{ fontSize: "0.95rem", color: "#666", lineHeight: 1.6 }}>
        Try drafting the most literal, on-the-nose version of your scene. Once
        you have exhausted the approach, compare it to the original "Show, Don't
        Tell" lesson to understand how clarity and subtext trade places.
      </footer>
    </section>
  );
}
