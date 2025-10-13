export type FunhouseGameType =
  | "writing_prompt"
  | "beat_arcade"
  | "style_swap"
  | "experimental"
  | string;

export type FunhouseComponentKey = "TellEverythingShowNothing" | string;

export interface FunhousePrompt {
  id: string;
  title: string;
  description: string;
  mirrors_lesson_id?: string;
  prompt_text: string;
  game_type: FunhouseGameType;
  ui_component: FunhouseComponentKey;
}

export type FunhouseCatalog = FunhousePrompt[];
