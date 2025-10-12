export interface WordEntry {
  word: string;
  from: {
    language: string;
    root: string;
    gloss: string;
  };
  literal: string;
}

export interface Pack {
  id: string;
  label: string;
  entries: WordEntry[];
}
