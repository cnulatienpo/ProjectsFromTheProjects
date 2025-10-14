import React from 'react'
import { api } from '@/lib/apiBase.js'

export function adaptToSpec(it){
  if (!it) return null
  if (it.input_type === 'mcq') {
    return {
      mode:'mcq',
      id: it.id,
      title: it.title || '',
      prompt: <div dangerouslySetInnerHTML={{__html: it.prompt_html || ''}} />,
      choices: it.choices || [],
      correctIndex: it.correct_index ?? 0
    }
  }
  // default to write/read
  return {
    mode: it.input_type === 'write' ? 'write' : 'read',
    id: it.id,
    title: it.title || '',
    prompt: <div dangerouslySetInnerHTML={{__html: it.prompt_html || ''}} />,
    minWords: it.min_words ?? 30
  }
}

// Good Word
export async function fetchGoodItem(id){
  const r = await fetch(api(`/goodword/game/${encodeURIComponent(id)}`))
  if (!r.ok) throw new Error(String(r.status))
  return adaptToSpec(await r.json())
}
export async function listGoodIds(){
  const r = await fetch(api('/goodword/catalog')); const j = await r.json()
  return j.games || []
}

// Sigil_&_Syntax
export async function fetchSigilItem(id){
  const r = await fetch(api(`/sigil/game/${encodeURIComponent(id)}`))
  if (!r.ok) throw new Error(String(r.status))
  return adaptToSpec(await r.json())
}
export async function firstSigilId(){
  const r = await fetch(api('/sigil/catalog')); const j = await r.json()
  return j.first || (j.games && j.games[0]) || null
}

