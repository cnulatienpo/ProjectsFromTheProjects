export type AttemptMode = "name"|"missing"|"order"|"highlight"|"fix"|"why"|"rewrite";

export type Span = { start:number; end:number; label?: string };

export type AttemptPayload = {
  userId: string;
  itemId: string;
  mode: AttemptMode;
  answer: {
    choiceId?: string;
    order?: string[];
    spans?: Span[];
    text?: string;
    rationale?: string;
    sigils?: string[]; // beats parsed from [ACTION], etc.
  };
};

export type AttemptResult = {
  itemId: string;
  mode: AttemptMode;
  score: number;             // 0..1
  rubric: string[];          // e.g., ["Accuracy","Clarity"]
  spans?: Span[];
  correctOrder?: string[];
  fixSuggestion?: string;
  next?: string;
  details?: Record<string, unknown>;
  leveledUp?: boolean;
  level?: number;
  badges?: string[];
};

export type ItemBase = {
  id: string;
  mode: AttemptMode;
  skillIds: string[];       // e.g., ["beat.conflict","comma.coordinate"]
  passage?: string;
  options?: { id:string; text:string; rationale?: string }[];
  gold?: {
    beats?: string[];
    order?: string[];
    spans?: Span[];
    choiceId?: string;
    rationaleTags?: string[];
    missingBeat?: string;
  };
  meta?: Record<string, unknown>;
};

export const normalizeText = (s?: string) => (s ?? "").replace(/\s+/g, " ").trim();
