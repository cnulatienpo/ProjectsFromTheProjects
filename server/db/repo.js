const attempts = new Map();

export async function saveAttempt(
    userId,
    payload,
    result,
    options = {}
) {
    const record = {
        userId,
        itemId: payload.itemId,
        mode: payload.mode,
        payload,
        result,
        affectMastery: options.affectMastery !== false,
        createdAt: new Date(),
    };
    const list = attempts.get(userId);
    if (list) {
        list.push(record);
    } else {
        attempts.set(userId, [record]);
    }
}

export async function getLastAttempt(userId) {
    const list = attempts.get(userId);
    if (!list?.length) return null;
    return list[list.length - 1];
}

export async function updateMastery(userId, payload, result) {
    // TODO: update mastery rows; return level-up info
    return { leveledUp: false, level: undefined, badges: [] };
}

export async function latestReport(userId) {
    // TODO: select last report for user
    return null;
}
