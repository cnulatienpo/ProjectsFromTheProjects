import type { JSX } from "react";
import { Navigate } from "react-router-dom";

export default function LiteraryDeviousnessAlias(): JSX.Element {
  return <Navigate to="/games/sigil-syntax" replace />;
}
