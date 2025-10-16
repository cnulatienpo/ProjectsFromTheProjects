// app/src/lib/snapshot.js
let html2canvasPromise = null

function loadHtml2Canvas() {
  if (html2canvasPromise) return html2canvasPromise
  html2canvasPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'
    s.async = true
    s.onload = () => resolve(window.html2canvas)
    s.onerror = () => reject(new Error('Failed to load html2canvas'))
    document.head.appendChild(s)
  })
  return html2canvasPromise
}

/**
 * Capture a DOM element and download a PNG.
 * @param {string|HTMLElement} target - CSS selector or element to capture (defaults to 'main').
 * @param {string} filename - Suggested download filename.
 */
export async function snapAndDownload(target = 'main', filename = 'screenshot.png') {
  const html2canvas = await loadHtml2Canvas()
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) throw new Error('snapshot: target element not found')
  // ensure a background so PNG isn’t transparent
  const prevBg = el.style.backgroundColor
  if (!prevBg) el.style.backgroundColor = '#ffffff'
  const canvas = await html2canvas(el, { useCORS: true, backgroundColor: '#ffffff', scale: 2 })
  if (!prevBg) el.style.backgroundColor = ''
  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}
