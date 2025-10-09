import { Chunk, Label, Item, Attempt, Mastery, type TChunk, type TLabel, type TItem, type TAttempt, type TMastery } from './schema'
const KEY = 'ld:store:v1'

type DB = {
    chunks: Record<string, TChunk>
    labels: Record<string, TLabel>
    items: Record<string, TItem>
    attempts: Record<string, TAttempt>
    mastery: Record<string, TMastery> // key `${user_id}:${skill}`
}

function blank(): DB { return { chunks: {}, labels: {}, items: {}, attempts: {}, mastery: {} } }

let db: DB = (() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '') as DB } catch { return blank() }
})()

function save() { try { localStorage.setItem(KEY, JSON.stringify(db)) } catch { } }

export const Store = {
    // CRUD (validated)
    upsertChunk(raw: unknown) {
        const v = Chunk.parse(raw); db.chunks[v.chunk_id] = v; save(); return v
    },
    upsertLabel(raw: unknown) {
        const v = Label.parse(raw); db.labels[v.label_id] = v; save(); return v
    },
    upsertItem(raw: unknown) {
        const v = Item.parse(raw); db.items[v.item_id] = v; save(); return v
    },
    addAttempt(raw: unknown) {
        const v = Attempt.parse(raw); db.attempts[v.attempt_id] = v; save(); return v
    },
    addXp({ user_id = 'local', skill, amount, last_item_id }: { user_id?: string, skill: string, amount: number, last_item_id?: string }) {
        const key = `${user_id}:${skill}`
        const cur = db.mastery[key] ?? Mastery.parse({ user_id, skill, xp: 0, level: 0 })
        const xp = (cur.xp ?? 0) + Math.max(0, Math.floor(amount))
        const level = Math.floor(xp / 100) // simple: 100xp per level; tweak later
        db.mastery[key] = { ...cur, xp, level, last_item_id }
        save()
        return db.mastery[key]
    },
    // Queries
    getItem(id: string) { return db.items[id] },
    listItems(filter?: Partial<TItem>) {
        const arr = Object.values(db.items)
        if (!filter) return arr
        return arr.filter(it => Object.entries(filter).every(([k, v]) => (it as any)[k] === v))
    },
    lastAttemptFor(item_id: string, user_id = 'local') {
        const arr = Object.values(db.attempts).filter(a => a.item_id === item_id && a.user_id === user_id)
        return arr.sort((a, b) => b.created_at - a.created_at)[0]
    },
    getMastery(user_id = 'local', skill?: string) {
        const rows = Object.values(db.mastery).filter(m => m.user_id === user_id)
        return skill ? rows.find(m => m.skill === skill) : rows
    },
    __debug_export() { return db },
    __debug_reset() { db = blank(); save() }
}
