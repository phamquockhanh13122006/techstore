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

// Hộp xác nhận thay cho confirm(). Dùng: if (!(await confirmDialog('Nội dung'))) return
export function confirmDialog(text, okText = 'Đồng ý', cancelText = 'Hủy bỏ') {
  return new Promise(resolve => {
    const overlay = document.createElement('div')
    overlay.className = 'confirm-overlay'
    overlay.innerHTML = `
      <div class="confirm-box">
        <p></p>
        <div class="confirm-actions">
          <button type="button" class="btn secondary confirm-cancel"></button>
          <button type="button" class="btn confirm-ok"></button>
        </div>
      </div>`
    overlay.querySelector('p').textContent = text
    overlay.querySelector('.confirm-ok').textContent = okText
    overlay.querySelector('.confirm-cancel').textContent = cancelText
    const close = result => {
      overlay.remove()
      resolve(result)
    }
    overlay.querySelector('.confirm-ok').onclick = () => close(true)
    overlay.querySelector('.confirm-cancel').onclick = () => close(false)
    overlay.onclick = e => { if (e.target === overlay) close(false) }
    document.body.appendChild(overlay)
  })
}