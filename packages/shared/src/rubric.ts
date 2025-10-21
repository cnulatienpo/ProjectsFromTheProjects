export type RubricKey = "Accuracy"|"Clarity"|"Voice"|"Consistency"|"Professionalism";

export const RUBRIC_ALL: RubricKey[] = ["Accuracy","Clarity","Voice","Consistency","Professionalism"];

export const RUBRIC_BY_MODE: Record<string, RubricKey[]> = {
  name: ["Accuracy","Clarity"],
  missing: ["Accuracy","Clarity"],
  order: ["Accuracy","Clarity","Consistency"],
  highlight: ["Accuracy","Clarity"],
  fix: ["Accuracy","Clarity","Professionalism","Voice"],
  why: ["Clarity","Consistency","Professionalism"],
  rewrite: ["Voice","Clarity","Accuracy","Consistency"]
};
