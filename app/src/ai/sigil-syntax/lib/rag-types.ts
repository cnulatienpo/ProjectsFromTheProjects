export type RagQuery = {
  text: string
  level?: number
  writerType?: string | null
  maxSuggestions?: number
}

export type RagCitation = {
  id: string
  title: string
  snippet: string
  score: number
}

export type RagDimensionScore = {
  name: string
  score: number
  rationale: string
}

export type RagEvidence = {
  quote: string
  note: string
  start?: number
  end?: number
}

export type RagResult = {
  overall: number
  dimensions: RagDimensionScore[]
  flags: string[]
  tips: string[]
  citations: RagCitation[]
  evidence: RagEvidence[]
  model?: string
  debug?: { retrievedCount?: number; usedOfflineMock?: boolean; from?: string }
}
