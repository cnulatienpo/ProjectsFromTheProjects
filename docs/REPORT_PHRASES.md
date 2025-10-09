# Report Phrases

- Author phrases in `app/src/ai/reportPhrases.ts`.
- Emit with `npm run emit:phrases` → backend reads `game thingss/reportPhrases.json`.

## Shape

```ts
export default {
  closers: { low: string[], mid: string[], high: string[] },
  tags: { [tag: string]: string[] },
  praise: string[],
  generic: string[]
}
```

Tags correspond to what `/api/judge` returns in `tags[]`.
