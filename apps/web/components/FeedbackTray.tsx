import React from "react";

type Props = {
  result: any | null;
  isLoading?: boolean;
};

export default function FeedbackTray({ result, isLoading }: Props) {
  const text =
    !result ? "" :
    typeof result === "string" ? result :
    JSON.stringify(result, null, 2);

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <label style={{ fontSize: 12, opacity: 0.8 }}>Feedback</label>
      <textarea
        aria-label="Feedback"
        readOnly
        value={isLoading ? "Grading..." : text}
        style={{
          width: "100%",
          minHeight: 160,
          padding: 12,
          background: "#0f0f0f",
          color: "#ddd",
          border: "1px solid #333",
          borderRadius: 8,
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          fontSize: 12,
          lineHeight: 1.4,
          whiteSpace: "pre",
          overflow: "auto",
        }}
      />
    </div>
  );
}
