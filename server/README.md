# PFP Backend

**Setup:**
```bash
npm i
npm run dev
```
(from `/server`)

**Endpoints:**
- `/catalog/games`
- `/catalog/game/:id`
- `/status`
- `/bundle/info`
- `/lessons`
- `/sign`
- `/sign-get`

_No SQL used. Content comes from `game thingss/build/bundle.json` (run `npm run build:packs` from repo root)._

To sync levels/badges from TypeScript → JSON for the backend, run:
`npm run emit:progression`

**Dev flow:**
- **Backend:** `cd server && npm i && npm run dev`
- **Frontend (Vite):** `cd app && npm run dev` (with the dev proxy you already added)
- **Prod (GitHub Pages):** the Actions workflow builds `app/dist`; the backend can run anywhere free (Codespaces public port works for now).
