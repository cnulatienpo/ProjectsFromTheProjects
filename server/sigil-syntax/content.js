import fs from 'fs'
import path from 'path'

const SIGIL = path.resolve('game things', 'build', 'sigil-syntax', 'bundle_sigil_syntax.json')

function safe(){
  try {
    return JSON.parse(fs.readFileSync(SIGIL,'utf8'))
  } catch {
    return { items:[], first:null }
  }
}

export function listSigilIds(){
  return (safe().items || []).map(x=>x.id)
}

export function getSigilItem(id){
  return (safe().items || []).find(x=>x.id === id) || null
}

export function firstSigilId(){
  return safe().first || null
}

