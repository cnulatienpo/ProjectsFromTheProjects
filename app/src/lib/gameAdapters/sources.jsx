import React from 'react'
import { safeFetchJSON } from '@/lib/apiBase'
import { toCatalogItems } from '@/lib/normalize'
import { getLesson } from '@/services/sigilLesson'

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
  const lesson = await getLesson(id)
  if (!lesson) return null
  const prompt_html = lessonToHtml(lesson)
  return adaptToSpec({
    id: lesson.id,
    title: lesson.title,
    prompt_html,
    input_type: 'write',
    min_words: 30,
  })
}
export async function firstSigilId(){
  const j = await safeFetchJSON('/sigil/catalog')
  const items = toCatalogItems(j)
  return j?.first || (items[0]?.id ?? null)
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function blockHtml(text = '') {
  const safe = escapeHtml(text)
  return safe
    .split(/\n\s*\n/)
    .map(block => `<p>${block.replace(/\n/g, '<br />')}</p>`)
    .join('')
}

function lessonToHtml(lesson) {
  if (!lesson) return ''
  const parts = []
  if (lesson.intro) parts.push(blockHtml(lesson.intro))
  if (lesson.prompt) parts.push(blockHtml(lesson.prompt))
  return parts.join('')
}

