export type FunhouseGameType =
  | "writing_prompt"
  | "beat_arcade"
  | "style_swap"
  | "experimental"
  | string;

export type FunhouseComponentKey =
  | "FreeWriteTextBox"
  | "BeatComboMachine"
  | "VoiceImpersonatorChallenge"
  | "VoiceSwapGame"
  | "GenreMangleMachine"
  | "MirrorDrillUI"
  | "OneParagraphChallenge"
  | string;

export interface FunhousePrompt {
  id: string;
  title: string;
  description: string;
  mirrors_lesson_id?: string;
  prompt_text: string;
  game_type: FunhouseGameType;
  ui_component: FunhouseComponentKey;
  constraint_type?: string;
  constraint_label?: string;
}

export type FunhouseCatalog = FunhousePrompt[];
