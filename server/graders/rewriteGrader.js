export default async function rewriteGrader(payload) {
    return {
        itemId: payload.itemId,
        mode: payload.mode,
        score: 0,
        rubric: [],
        details: { message: "rewrite grader not implemented" },
    };
}
