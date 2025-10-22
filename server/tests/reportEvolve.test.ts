import { describe, it, expect, vi } from 'vitest'

// helpers: minimal fake game so evaluateAttempt() has context
const W_GAME = { id: 'write-demo', title: 'Write Demo', input_type: 'write', skill: 'grammar', min_words: 20 }
const M_GAME = { id: 'mcq-demo', title: 'MCQ Demo', input_type: 'mcq', skill: 'grammar', correct_index: 1 }

vi.mock('../bundle.js', () => ({
    getItem: (id: string) => (id === 'write-demo' ? W_GAME : id === 'mcq-demo' ? M_GAME : null) as any,
    readBundle: () => ({ items: [W_GAME, M_GAME], lessons: [], skills_map: {} }),
    listItemIds: () => [W_GAME.id, M_GAME.id],
    listLessons: () => [],
    getLesson: () => null,
}));

import { evaluateAttempt } from '../sigil-syntax/judgment.js'
import { evolveReport } from '../sigil-syntax/reportEvolve.js'

describe('report evolves across attempts', () => {
    it('escalates focus and avoids repeating the same tags', () => {
        const hist: any[] = []

        // 1st attempt — short text (expect structure/length nudges)
        const r1 = evaluateAttempt({ id: 'write-demo', response: 'Too short', baseScore: 0.3 })
        const e1 = evolveReport(hist, r1); hist.push(r1)
        expect(e1.feedback.length).toBeGreaterThan(0)

        // 2nd attempt — longer, but passive-ish
        const r2 = evaluateAttempt({ id: 'write-demo', response: 'It was decided by the team because it was needed by many people.', baseScore: 0.6 })
        const e2 = evolveReport(hist, r2); hist.push(r2)
        // Should continue providing actionable guidance
        expect(e2.feedback.some(m => m.startsWith('Next:'))).toBe(true)

        // 3rd attempt — MCQ perfect on first try (should move to praise/action)
        const r3 = evaluateAttempt({ id: 'mcq-demo', response: { key: 1 }, baseScore: 1 })
        const e3 = evolveReport(hist, r3)
        expect(e3.feedback.some(m => /Next:/.test(m))).toBe(true)
    })
})
