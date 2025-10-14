import fs from 'fs'
import path from 'path'

const GOOD = path.resolve('game things', 'build', 'bundle_good_word.json')

function safe(p){
  try {
    return JSON.parse(fs.readFileSync(p,'utf8'))
  } catch {
    return { items:[] }
  }
}

export function listGoodIds(){
  return (safe(GOOD).items || []).map(x=>x.id)
}

export function getGoodItem(id){
  return (safe(GOOD).items || []).find(x=>x.id === id) || null
}

