import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Orders() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    fetch('/api/orders', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Không tải được đơn hàng')
        return res.json()
      })
      .then(json => setOrders(json.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [user])

  if (authLoading) return <p>Đang tải...</p>
  if (!user) return <Navigate to="/login" />

  return (
    <div>
      <h1>Đơn hàng của tôi</h1>
      {loading && <p>Đang tải...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && orders.length === 0 && (
        <p>Bạn chưa có đơn hàng nào. <Link to="/products">Mua sắm ngay</Link></p>
      )}

      {orders.map((o, index) => (
        <div className="order" key={o._id || o.id || index}>
          <div className="order-head">
            <strong>Đơn #{o.id || String(o._id || index + 1).slice(-6)}</strong>
            <span className="status">{o.status}</span>
            {o.createdAt && <span>{new Date(o.createdAt).toLocaleString('vi-VN')}</span>}
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