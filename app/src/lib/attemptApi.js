import { api } from '@/lib/apiBase'
import { safeFetchJSON } from '@/lib/apiBase'

export async function submitAttempt({ id, text, minWords }) {
    return safeFetchJSON(api('/attempt'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, text, minWords })
    })
}
