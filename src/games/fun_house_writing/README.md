# Fun House Writing

This module collects the weirder, remix-friendly writing exercises that live in the Funhouse wing of the project. The goal is to provide a clear catalog of prompts alongside reusable UI components so that designers can ship oddball ideas without rewiring the rest of the game shell.

## Directory Tour

- `funhouse_catalog.ts` — canonical list of Funhouse prompt metadata. Each entry links to a UI component and describes how the game riffs on an existing lesson.
- `types.ts` — shared type definitions for prompts, game types, and component keys.
- `components/` — React components that actually render the gameplay experience for each Funhouse prompt.
- `index.tsx` — lightweight entry point that selects the correct UI component at runtime.
- `playground/` — a sandbox for experiments, prototypes, or reference implementations that are not yet player-ready.

## Development Notes

1. Add new prompts to `funhouse_catalog.ts` and give them a `ui_component` string.
2. Implement the matching component inside `components/` and register it in `index.tsx`'s `componentRegistry`.
3. Use the `playground/` folder when exploring odd mechanics or writing helpers before promoting them into production code.
