import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleOrder() {
    if (!user) {
      alert('Bạn cần đăng nhập để đặt hàng.')
      navigate('/login')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.id, quantity: i.quantity }))
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Đặt hàng thất bại')
      clearCart()
      alert('Đặt hàng thành công!')
      navigate('/orders')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div>
        <h1>Giỏ hàng</h1>
        <p>Giỏ hàng đang trống.</p>
        <Link to="/products">← Tiếp tục mua sắm</Link>
      </div>
    )
  }

  return (
    <div>
      <h1>Giỏ hàng</h1>

      {items.map(item => (
        <div className="cart-item" key={item.id}>
          <img src={item.image} alt={item.name} />
          <div className="cart-info">
            <h3>{item.name}</h3>
            <p className="price">{Number(item.price).toLocaleString('vi-VN')} đ</p>
          </div>
          <div className="qty">
            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
            <span>{item.quantity}</span>
            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
          </div>
          <p className="subtotal">
            {(item.price * item.quantity).toLocaleString('vi-VN')} đ
          </p>
          <button className="remove" onClick={() => removeFromCart(item.id)}>Xóa</button>
        </div>
      ))}

      <div className="cart-total">
        <h2>Tổng cộng: {totalPrice.toLocaleString('vi-VN')} đ</h2>
        {error && <p className="error">{error}</p>}
        <button className="btn secondary" onClick={clearCart}>Xóa hết</button>
        <button className="btn" onClick={handleOrder} disabled={submitting}>
          {submitting ? 'Đang đặt...' : 'Đặt hàng'}
        </button>
      </div>
    </div>
  )
}
