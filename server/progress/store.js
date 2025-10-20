import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'

const DATA_DIR = path.resolve('server', 'data')
const FILE = path.join(DATA_DIR, 'progress.json')

function ensureDir() { fs.mkdirSync(DATA_DIR, { recursive: true }) }

export async function readProgress() {
  ensureDir()
  try { return JSON.parse(await fsp.readFile(FILE, 'utf8') || '{}') } catch { return {} }
}

export async function writeProgress(obj) {
  ensureDir()
  await fsp.writeFile(FILE, JSON.stringify(obj, null, 2), 'utf8')
}

/**
 * shape: userId -> {
 *   lastId?: string,
 *   started: string[],
 *   submitted: string[],
 *   skipped: string[],
 *   verdicts: Record<string,string>
 * }
 */
export async function mark(userId, lessonId, kind, verdict) {
  if (!userId || !lessonId) return
  const db = await readProgress()
  const u = db[userId] ||= { lastId: null, started: [], submitted: [], skipped: [], verdicts: {} }
  if (kind === 'started') {
    if (!u.started.includes(lessonId)) u.started.push(lessonId)
    u.lastId = lessonId
  } else if (kind === 'submitted') {
    if (!u.started.includes(lessonId)) u.started.push(lessonId)
    if (!u.submitted.includes(lessonId)) u.submitted.push(lessonId)
    if (verdict) u.verdicts[lessonId] = verdict
    u.lastId = lessonId
  } else if (kind === 'skipped') {
    if (!u.started.includes(lessonId)) u.started.push(lessonId)
    if (!u.skipped.includes(lessonId)) u.skipped.push(lessonId)
    u.lastId = lessonId
  }
  await writeProgress(db)
  return u
}

export async function getUserState(userId) {
  const db = await readProgress()
  return db[userId] || { lastId: null, started: [], submitted: [], skipped: [], verdicts: {} }
}
