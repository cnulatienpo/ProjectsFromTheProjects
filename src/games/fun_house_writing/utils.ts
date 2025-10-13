export function resolveFunhouseDistortion(
  constraintLabel?: string,
  constraintType?: string,
): string {
  if (constraintLabel && constraintType) {
    return `${constraintLabel} (${constraintType})`;
  }

  return constraintLabel ?? constraintType ?? "Funhouse Remix";
}
