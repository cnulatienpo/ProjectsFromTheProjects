export type AttemptMode = "name"|"missing"|"order"|"highlight"|"fix"|"why"|"rewrite";

export type AttemptPayload = {
  userId: string;
  itemId: string;
  mode: AttemptMode;
  answer: {
    // any mode can send any of these; graders pick what they need
    choiceId?: string;
    order?: string[];
    spans?: { start:number; end:number }[];
    text?: string;
    rationale?: string;
    sigils?: string[];   // beats like [ACTION] parsed client-side or server-side
  };
};

export type AttemptResult = {
  itemId: string;
  mode: AttemptMode;
  score: number;                   // 0..1
  rubric: string[];                // e.g., ["Accuracy","Clarity"]
  spans?: { start:number; end:number; label?: string }[];
  correctOrder?: string[];         // for order mode
  fixSuggestion?: string;          // for fix/rewrite hints
  next?: string;                   // short next-drill hint
  details?: Record<string, unknown>;
  leveledUp?: boolean;
  level?: number;
  badges?: string[];
};
