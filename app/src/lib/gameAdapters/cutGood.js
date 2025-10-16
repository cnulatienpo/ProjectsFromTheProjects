import React from 'react'
import { safeFetchJSON } from '@/lib/apiBase'

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
  const json = await safeFetchJSON(`/cut/game/${encodeURIComponent(id)}`)
  return adaptItem(json)
}

export async function fetchGoodItem(id) {
  const json = await safeFetchJSON(`/goodword/game/${encodeURIComponent(id)}`)
  return adaptItem(json)
}

export async function listCutIds() {
  const j = await safeFetchJSON('/cut/catalog')
  return j.items || j.games || []
}
export async function listGoodIds() {
  const j = await safeFetchJSON('/goodword/catalog')
  return j.items || j.games || []
}
