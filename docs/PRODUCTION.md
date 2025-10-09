# Production Guide — GitHub Pages (Frontend) + Minimal Express (Backend)

This app ships the **frontend** on **GitHub Pages** (free) and runs a tiny **Express** backend separately (can be Codespaces, Render, Fly, etc.). No Docker, no SQL.

---

## What gets deployed where?

- **Frontend (SPA):** `/app` built by Vite and published to **GitHub Pages** via workflow `.github/workflows/pages.yml`.
- **Backend (API):** `/server` Express app exposing:
  - `GET /catalog/games`
  - `GET /catalog/game/:id`
  - `GET /bundle/info`
  - `GET /lessons`
  - `GET /status`
  - `POST /sign` and `POST /sign-get` (Backblaze presign)

> Frontend calls the backend with a small toggle: in **dev** it uses the Vite **proxy**; in **prod** (Pages) it uses `VITE_PROD_API` (an absolute URL).

---

## Frontend (GitHub Pages) setup

1. **Vite base path**
   - In `app/vite.config.js`, set:
     ```js
     const REPO = process.env.GHPAGES_REPO || 'your-repo-name'
     export default defineConfig({ base: process.env.GHPAGES_BASE || `/${REPO}/`, /* … */ })
     ```

2. **SPA fallback (404 copy)**
   - Build script copies `dist/index.html` → `dist/404.html` (see `app/scripts/copy-404.js`).
   - This makes client-side routes work on Pages.

3. **GitHub Actions workflow**
   - `.github/workflows/pages.yml` builds `app/` and publishes `app/dist` to Pages.
   - In repo **Settings → Pages**, select **Build from: GitHub Actions**.

4. **Prod backend URL for Pages**
   - In `app/.env.example`:
     ```
     VITE_PROD_API=   # e.g. https://your-backend.onrender.com
     ```
   - When the site is hosted on `github.io`, the app uses `VITE_PROD_API` for API calls.

---

## Backend (Express) quick start

The backend reads content from files (no SQL). Typical endpoints live at your chosen host.

**Run locally (dev):**
```bash
cd server
npm i
npm run dev
# server listens on 8787 by default (see index.js)
```

Required env (server/.env):

```
# Backblaze / S3-compatible (presign)
B2_KEY_ID=
B2_APP_KEY=
B2_BUCKET=
B2_REGION=
B2_S3_ENDPOINT=

# Optional banner
MAINTENANCE_MSG=

# Foundations tuning
FOUNDATION_TARGET=0.8
FOUNDATION_MIN_PRACTICE=2
```

Content bundle (optional but recommended):

Build from your JSONL packs:

```bash
# from repo root
npm run build:packs
```

Backend serves from game thingss/build/bundle.json.

Dev workflow (two terminals)

Backend:

```bash
cd server
npm i
npm run dev
```

Frontend:

```bash
cd app
npm i
npm run dev
# Vite proxy forwards /catalog, /bundle, /lessons, /status, /sign to the backend
```

Open:

App: http://localhost:5173/

Bundle info: http://localhost:5173/bundle (if added)

Backend (direct): http://localhost:8787/bundle/info

Codespaces? Make port 8787 Public in the Ports panel so the frontend (and you) can reach it.

---

## Deploy to GitHub Pages

Commit and push to main.

GitHub Actions runs the Pages workflow.

Your site appears at:

```
https://<your-username>.github.io/<repo>/
```

Make sure any production API calls use VITE_PROD_API:

In app/src/lib/apiBase.js:

```js
const isProd = /github\.io$/.test(location.hostname)
const PROD_API = import.meta.env.VITE_PROD_API || ''
export const api = (p='') => `${isProd ? PROD_API : ''}${p}`
```

Frontend fetches use api('/catalog/games'), api('/status'), etc.

---

## Troubleshooting

- **White screen on deep link:** ensure 404.html exists in the built dist/.
- **Broken assets / wrong paths:** Vite base must match /<repo>/. Update GHPAGES_REPO / GHPAGES_BASE in the workflow if you rename the repo.
- **401/CORS in dev:** use the Vite proxy (already configured). If calling the backend directly, enable app.use(cors({ origin: true })) and expose Codespaces port publicly.
- **API works locally but not on Pages:** set VITE_PROD_API to the full backend URL (https), redeploy the frontend.

---

## Backups/Restore

We no longer restore `.sqlite` files.

State is stored in the browser (`localStorage`) and on the backend in memory.

Use the new state export/import (see `/state` page in the app) to back up or move your progress.
