import React from 'react'
import { safeFetchJSON } from '@/lib/apiBase'

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
  const j = await safeFetchJSON(`/goodword/game/${encodeURIComponent(id)}`)
  return adaptToSpec(j)
}
export async function listGoodIds(){
  const j = await safeFetchJSON('/goodword/catalog')
  return j.items || j.games || []
}

// Sigil_&_Syntax
export async function fetchSigilItem(id){
  const j = await safeFetchJSON(`/sigil/game/${encodeURIComponent(id)}`)
  return adaptToSpec(j)
}
export async function firstSigilId(){
  const j = await safeFetchJSON('/sigil/catalog')
  return j.first || (j.items && j.items[0]) || (j.games && j.games[0]) || null
}

