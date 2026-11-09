export function showToast(text, type = 'success', ms = 2000) {
  const el = document.createElement('div')
  el.className = `toast ${type}`
  el.textContent = text
  document.body.appendChild(el)
  setTimeout(() => {
    el.style.transition = 'opacity 0.3s'
    el.style.opacity = '0'
    setTimeout(() => el.remove(), 300)
  }, ms)
}