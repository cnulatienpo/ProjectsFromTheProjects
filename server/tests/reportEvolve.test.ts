import { describe, it, expect } from 'vitest'
import { evaluateAttempt } from '../judgment.js'
import { evolveReport } from '../reportEvolve.js'

// helpers: minimal fake game so evaluateAttempt() has context
const W_GAME = { id: 'write-demo', title: 'Write Demo', input_type: 'write', skill: 'grammar', min_words: 20 }
const M_GAME = { id: 'mcq-demo', title: 'MCQ Demo', input_type: 'mcq', skill: 'grammar', correct_index: 1 }

// monkey-patch getItem() used by evaluateAttempt
import * as bundle from '../bundle.js'
bundle.getItem = (id: string) => (id === 'write-demo' ? W_GAME : id === 'mcq-demo' ? M_GAME : null) as any

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
        // Should prefer new focus (not just repeat first attempt’s tag)
        expect(e2.feedback.join(' ')).not.toEqual(e1.feedback.join(' '))

        // 3rd attempt — MCQ perfect on first try (should move to praise/action)
        const r3 = evaluateAttempt({ id: 'mcq-demo', response: { key: 1 }, baseScore: 1 })
        const e3 = evolveReport(hist, r3)
        expect(e3.feedback.some(m => /Next:/.test(m))).toBe(true)
    })
})
