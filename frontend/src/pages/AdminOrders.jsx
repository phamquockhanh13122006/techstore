import { useState, useEffect } from 'react'

const STATUSES = ['pending', 'shipping', 'done', 'cancelled']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')

  function load() {
    fetch('/api/admin/orders', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Không tải được đơn hàng')
        return res.json()
      })
      .then(json => setOrders(json.data))
      .catch(err => setError(err.message))
  }

  useEffect(load, [])

  async function changeStatus(id, status) {
    const res = await fetch('/api/admin/orders/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status })
    })
    if (!res.ok) {
      const json = await res.json()
      setError(json.message || 'Cập nhật thất bại')
      return
    }
    load()
  }

  return (
    <div>
      <h1>Quản lý đơn hàng</h1>
      {error && <p className="error">{error}</p>}
      {orders.length === 0 && !error && <p>Chưa có đơn hàng nào.</p>}

      {orders.map(o => (
        <div className="order" key={o.id}>
          <div className="order-head">
            <strong>Đơn #{o.id}</strong>
            <span>{o.customerName} ({o.customerEmail})</span>
            {o.createdAt && <span>{new Date(o.createdAt).toLocaleString('vi-VN')}</span>}
            <select value={o.status} onChange={e => changeStatus(o.id, e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {o.items.map((it, i) => (
            <p className="order-line" key={i}>
              {it.name} × {it.quantity} — {(it.price * it.quantity).toLocaleString('vi-VN')} đ
            </p>
          ))}
          <p className="order-total">Tổng: {Number(o.total).toLocaleString('vi-VN')} đ</p>
        </div>
      ))}
    </div>
  )
}