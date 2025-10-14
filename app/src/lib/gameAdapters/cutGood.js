import React from 'react'
import { api } from '@/lib/apiBase.js'

// normalize a server game to your GameItem spec
export function adaptItem(it) {
  // default to MCQ wiring; highlight/order can be added later
  if (it.input_type === 'mcq') {
    return {
      mode: 'mcq',
      id: it.id,
      prompt: <div dangerouslySetInnerHTML={{ __html: it.prompt_html || '' }} />,
      choices: it.choices || [],
      correctIndex: it.correct_index ?? 0,
      title: it.title || ''
    }
  }
  // fallback to read-only
  return {
    mode: 'read',
    id: it.id,
    prompt: <div dangerouslySetInnerHTML={{ __html: it.prompt_html || '' }} />,
    title: it.title || ''
  }
}

export async function fetchCutItem(id) {
  const r = await fetch(api(`/cut/game/${encodeURIComponent(id)}`))
  if (!r.ok) throw new Error(String(r.status))
  return adaptItem(await r.json())
}

export async function fetchGoodItem(id) {
  const r = await fetch(api(`/goodword/game/${encodeURIComponent(id)}`))
  if (!r.ok) throw new Error(String(r.status))
  return adaptItem(await r.json())
}

export async function listCutIds() {
  const r = await fetch(api('/cut/catalog')); const j = await r.json()
  return j.games || []
}
export async function listGoodIds() {
  const r = await fetch(api('/goodword/catalog')); const j = await r.json()
  return j.games || []
}
