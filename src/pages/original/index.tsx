import type { JSX } from "react";
import { Navigate } from "react-router-dom";

export default function OriginalAlias(): JSX.Element {
  return <Navigate to="/sigil-syntax" replace />;
}
