import fs from 'fs'
import path from 'path'

const STATUS_PATH = path.resolve('game thingss', 'status.json')
const PKG_PATH = path.resolve('package.json')

export function readStatus() {
    let msg = ''
    let mode = 'ok'
    let version = '0.1.0'
    let time = new Date().toISOString()

    if (fs.existsSync(STATUS_PATH)) {
        try {
            const raw = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8'))
            msg = raw.maintenance_msg || ''
            mode = raw.mode || 'ok'
            version = raw.version || version
        } catch { }
    } else {
        msg = process.env.MAINTENANCE_MSG || ''
        try {
            const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'))
            version = pkg.version || version
        } catch { }
    }

    return { maintenance_msg: msg, mode, version, time }
}
