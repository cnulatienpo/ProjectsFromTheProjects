export function getPerkCopy(unlock) {
    const perks = {
        grammar: 'Unlocks advanced grammar tips!',
        devices: 'Unlocks literary devices hints!',
        story: 'Unlocks story structure advice!'
    }
    return perks[unlock] || 'No perk available.'
}
