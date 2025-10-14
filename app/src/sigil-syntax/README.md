# Sigil_&_Syntax (UI namespace)

This folder contains the UI for the Sigil_&_Syntax game.

- Display name: **Sigil_&_Syntax** (UI only)
- Code slug: `sigil-syntax`
- Export surface: `GameLayout`, `GameItem`, `StyleReportBox`, `NotesPanel`, `LevelUpModal`, `GameRunner`

## Integration checkpoints

- The front-end imports these modules through the Vite alias `@sigil` (see `app/vite.config.js`).
- `GameRunner.jsx` handles the play flow, then renders the style report **only on the results screen**, after points → level → badges.
- Style report requests POST `/style-report` and expects JSON with score, counts, notes, tags, and evolved feedback.
