# Sigil_&_Syntax (UI namespace)

This folder contains the UI for the game previously called “Literary Deviousness.”

- Display name: **Sigil_&_Syntax**
- Code slug: `sigil-syntax` (safe for files/routes)

Key components: GameLayout, GameItem, NotesPanel, LevelUpModal, BadgeStrip, StyleReportBox, GameRunner.

## Integration checkpoints

- The front-end imports these modules via the Vite alias `@sigil` (see `app/vite.config.js`).
- `GameRunner.jsx` requests style analysis results from the backend and renders the `StyleReportBox` with the Sigil_&_Syntax branding.
- Server-side style analysis lives under `server/sigil-syntax/styleReport.js` and is wired into `judgment.js`.
