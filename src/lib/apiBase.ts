export const apiBase = (() => {
  const env = import.meta.env.VITE_DEV_API?.toString().trim()
  if (env) return env.replace(/\/$/, '')
  if (typeof window !== 'undefined') {
    const { origin } = window.location
    if (origin.includes('.app.github.dev')) {
      return origin.replace(/-\d+\.app\.github\.dev$/, '-3001.app.github.dev')
    }
  }
  return ''
})()

export const apiUrl = (path: string) => {
  if (!path) return apiBase
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${apiBase}${suffix}`
}
