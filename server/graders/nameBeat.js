import { BEATS } from "../lib/beatPalette.js";
import { BEAT_SYNONYMS } from "./aliases.js";

const CANON = new Set(BEATS.map(b => b.key));

function canon(s) {
    return s?.toLowerCase().replace(/[_-]/g, " ").trim();
}

function expand(userKeys) {
    const out = new Set();
    for (const k of userKeys) {
        const ck = canon(k);
        if (!ck) continue;
        out.add(ck);
        const syns = BEAT_SYNONYMS[ck] || [];
        for (const s of syns) {
            const cs = canon(s);
            if (cs) out.add(cs);
        }
    }
    return out;
}

export default async function nameBeat(p) {
    const gold = p.goldBeats || [];
    const expected = new Set(
        gold
            .map(canon)
            .filter(key => Boolean(key) && CANON.has(key)),
    );

    const user = expand(p.answer.sigils || []);
    let hit = 0;
    for (const e of expected) {
        if (user.has(e)) hit += 1;
    }
    const score = expected.size ? hit / expected.size : 0;
    const rubric = score >= 0.67 ? ["Accuracy", "Clarity"] : ["Accuracy"];
    return {
        itemId: p.itemId,
        mode: p.mode,
        score,
        rubric,
        details: { expected: Array.from(expected), provided: Array.from(user) },
        next: score < 1 ? "Try pairing Red (move) with Blue (clarify)." : undefined,
    };
}
