import React from 'react'

// convert a backend game def into our GameItem spec
export function toSpec(game) {
    const html = { __html: game.prompt_html || '' }
    const base = { id: game.id, mode: 'read', prompt: <div dangerouslySetInnerHTML={html} /> }

    switch (game.input_type) {
        case 'write':
            return { ...base, mode: 'write', minWords: game.min_words ?? 30 }
        case 'mcq':
            return { ...base, mode: 'mcq', choices: game.choices || [], correctIndex: game.correct_index ?? 0 }
        case 'read':
            return base
        case 'highlight':
        case 'order':
        default:
            return {
                ...base,
                prompt: (
                    <>
                        <div dangerouslySetInnerHTML={html} />
                        <p style={{ opacity: .7, marginTop: 12 }}>(This mode isn’t interactive yet.)</p>
                    </>
                )
            }
    }
}
