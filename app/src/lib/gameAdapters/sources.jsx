import React from 'react'
import { api, safeFetchJSON } from '@/lib/apiBase.js'

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
  const j = await safeFetchJSON(api(`/goodword/game/${encodeURIComponent(id)}`))
  return adaptToSpec(j)
}
export async function listGoodIds(){
  const j = await safeFetchJSON(api('/goodword/catalog'))
  return j.games || []
}

// Sigil_&_Syntax
export async function fetchSigilItem(id){
  const j = await safeFetchJSON(api(`/sigil/game/${encodeURIComponent(id)}`))
  return adaptToSpec(j)
}
export async function firstSigilId(){
  const j = await safeFetchJSON(api('/sigil/catalog'))
  return j.first || (j.games && j.games[0]) || null
}

