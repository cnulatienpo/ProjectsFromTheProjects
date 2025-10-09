import fs from 'fs'
import path from 'path'

const FILE = path.resolve('game thingss', 'features.json')

const defaults = {
    catalog: true,
    bundleDriven: true,
    levelsBadges: true,
    highlightMode: false,
    orderMode: false,
    maintenanceOnly: false
}

export function readFeatures() {
    try {
        if (fs.existsSync(FILE)) {
            const f = JSON.parse(fs.readFileSync(FILE, 'utf8'))
            return { ...defaults, ...f }
        }
    } catch { }
    return { ...defaults }
}
