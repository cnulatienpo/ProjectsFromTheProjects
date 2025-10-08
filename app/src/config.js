export const CFG = {
    appName: import.meta.env.VITE_APP_NAME || 'Projects From The Projects',
    debug: (import.meta.env.VITE_DEBUG || 'false').toLowerCase() === 'true',
}
