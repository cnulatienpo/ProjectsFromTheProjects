import { z } from 'zod'

/** Mirror your SQL tables as Zod schemas (edit fields/names to match your .sql exactly) */
export const Chunk = z.object({
    chunk_id: z.string(),        // PRIMARY KEY
    source_csv: z.string().optional(),
    word_len: z.number().int().nonnegative().optional(),
    meta: z.any().default({})    // JSON in SQL → unknown here
})

export const Label = z.object({
    label_id: z.string(),        // PRIMARY KEY
    chunk_id: z.string(),        // FK → chunk.chunk_id
    tag: z.string(),             // e.g., 'metaphor' | 'simile'
    meta: z.any().default({})
})

export const Item = z.object({
    item_id: z.string(),         // PRIMARY KEY
    chunk_id: z.string().optional(), // if items reference chunks
    prompt: z.string(),
    game_type: z.enum(['grammar', 'devices', 'structure', 'freewrite']).default('grammar'),
    rubric: z.any().default({})  // JSON blob for scoring hints
})

export const Attempt = z.object({
    attempt_id: z.string(),      // PRIMARY KEY
    item_id: z.string(),         // FK → item.item_id
    user_id: z.string().default('local'),
    response: z.string(),
    score: z.number().min(0).max(1).optional(),
    created_at: z.number().int() // Date.now()
})

export const Mastery = z.object({
    user_id: z.string().default('local'),
    skill: z.string(),           // e.g., 'metaphor'
    xp: z.number().int().nonnegative().default(0),
    level: z.number().int().nonnegative().default(0),
    last_item_id: z.string().optional()
})

export type TChunk = z.infer<typeof Chunk>
export type TLabel = z.infer<typeof Label>
export type TItem = z.infer<typeof Item>
export type TAttempt = z.infer<typeof Attempt>
export type TMastery = z.infer<typeof Mastery>
