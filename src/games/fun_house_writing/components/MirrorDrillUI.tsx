import React from "react";
import { FunhousePrompt } from "../types";

interface MirrorDrillUIProps {
  prompt: FunhousePrompt;
}

const labelStyles: React.CSSProperties = {
  textTransform: "uppercase",
  fontSize: "0.75rem",
  letterSpacing: "0.08em",
  color: "#0f172a",
};

const MirrorDrillUI: React.FC<MirrorDrillUIProps> = ({ prompt }) => {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 720 }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{prompt.title}</h1>
        <p style={{ color: "#1f2937", lineHeight: 1.6 }}>{prompt.description}</p>
      </header>
      <section style={{ marginBottom: "1.5rem" }}>
        <div style={{ marginBottom: "0.5rem", ...labelStyles }}>Prompt</div>
        <p style={{ background: "#ecfeff", padding: "1rem", borderRadius: "0.75rem", lineHeight: 1.6 }}>
          {prompt.prompt_text}
        </p>
      </section>
      <section style={{ display: "grid", gap: "1rem" }}>
        <article style={{ background: "#cffafe", borderRadius: "0.75rem", padding: "1rem" }}>
          <div style={labelStyles}>Step 1</div>
          <p style={{ margin: 0 }}>Write the scene once exactly as directed. Don’t name the emotion.</p>
        </article>
        <article style={{ background: "#bae6fd", borderRadius: "0.75rem", padding: "1rem" }}>
          <div style={labelStyles}>Step 2</div>
          <p style={{ margin: 0 }}>
            Now exaggerate or deny the feeling per the twist. Compare the drafts and note which lines make the emotion clearest
            without naming it.
          </p>
        </article>
      </section>
    </div>
  );
};

export default MirrorDrillUI;
