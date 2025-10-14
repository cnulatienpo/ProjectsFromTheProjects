import React from "react";
import { Link } from "react-router-dom";

function join(base: string, segment?: string): string {
  const trimmed = base.replace(/\/+$/, "");
  if (!segment) {
    return trimmed || ".";
  }
  if (!trimmed || trimmed === ".") {
    return segment;
  }
  return `${trimmed}/${segment}`;
}

export function GameMenu(props: { base: string; showRules?: boolean }) {
  const { base, showRules = true } = props;
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        padding: "10px 16px",
        borderBottom: "1px solid #eee",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <Link to={join(base)} style={{ textDecoration: "none" }}>
        Home
      </Link>
      <Link to={join(base, "play")} style={{ textDecoration: "none" }}>
        Play
      </Link>
      {showRules && (
        <Link to={join(base, "rules")} style={{ textDecoration: "none" }}>
          Rules
        </Link>
      )}
    </div>
  );
}
