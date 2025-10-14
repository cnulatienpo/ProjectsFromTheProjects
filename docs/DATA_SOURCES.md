# Data sources

## The Good Word

* Reads every `the-good-word-*.json` under `labeled data/`.
* Emits a normalized bundle at `game things/build/bundle_good_word.json`.

## Sigil_&_Syntax

* Composes write/read lessons from `labeled data/tweetrunk_renumbered/`, ordering files by their leading number (lowest first).
* Outputs the combined lessons to `game things/build/sigil-syntax/bundle_sigil_syntax.json`.
* If `game things/cut_games_items_index.csv` and `game things/cut_games_game_blueprints.json` both exist, the CSV data takes priority; the JSON is a fallback when CSV is missing.

