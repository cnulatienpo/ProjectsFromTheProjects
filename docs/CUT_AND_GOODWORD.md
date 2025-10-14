# Cut Game & The Good Word

## Build
- `npm run emit:cut` → writes `game thingss/build/bundle_cut_game.json`
- `npm run emit:good` → writes `game thingss/build/bundle_good_word.json`
- `npm run emit:games` → both

## Server
- Cut Game:
  - `GET /cut/catalog` → `{ games: string[] }`
  - `GET /cut/game/:id` → one item
- The Good Word:
  - `GET /goodword/catalog` → `{ games: string[] }`
  - `GET /goodword/game/:id` → one item

## Frontend
- Routes:
  - `/cut/:id` → plays a Cut Game item
  - `/goodword/:id` → plays a Good Word item
- Adapter: `app/src/lib/gameAdapters/cutGood.js` normalizes items to the GameItem spec (MCQ/read).
