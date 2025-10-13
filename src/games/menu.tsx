import React from "react";
import { Link } from "react-router-dom";

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
      <Link to={`${base}`} style={{ textDecoration: "none" }}>
        Home
      </Link>
      <Link to={`${base}/play`} style={{ textDecoration: "none" }}>
        Play
      </Link>
      {showRules && (
        <Link to={`${base}/rules`} style={{ textDecoration: "none" }}>
          Rules
        </Link>
      )}
    </div>
  );
}
