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
  const [placed, setPlaced] = useState(false)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({ fullName: user?.name || '', phone: '', address: '' })
  const [payment, setPayment] = useState('cod')

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function showToast(type, text, ms = 2500) {
    setToast({ type, text })
    setTimeout(() => setToast(null), ms)
  }

  async function handleOrder(e) {
    e.preventDefault()
    if (!user) {
      showToast('error', 'Bạn cần đăng nhập để đặt hàng.', 1500)
      setTimeout(() => navigate('/login'), 1000)
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
          items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
          shippingAddress: form,
          paymentMethod: payment
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Đặt hàng thất bại')
      setPlaced(true)
      clearCart()
      showToast('success', 'Đặt hàng thành công!', 1500)
      setTimeout(() => navigate('/orders'), 1200)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const toastEl = toast && <div className={`toast ${toast.type}`}>{toast.text}</div>

  if (placed) {
    return (
      <div className="order-done">
        {toastEl}
        <h1>Cảm ơn bạn đã đặt hàng!</h1>
        <p>Đang chuyển đến trang Đơn hàng...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div>
        {toastEl}
        <h1>Giỏ hàng</h1>
        <p>Giỏ hàng đang trống.</p>
        <Link to="/products">← Tiếp tục mua sắm</Link>
      </div>
    )
  }

  return (
    <div>
      {toastEl}
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

      <form className="checkout" onSubmit={handleOrder}>
        <h3>Thông tin giao hàng</h3>
        <input name="fullName" placeholder="Họ tên người nhận" value={form.fullName}
               onChange={onChange} required />
        <input name="phone" type="tel" placeholder="Số điện thoại (ví dụ 0912345678)"
               value={form.phone} onChange={onChange} required />
        <input name="address" placeholder="Địa chỉ nhận hàng" value={form.address}
               onChange={onChange} required />

        <div className="payment">
          <label>
            <input type="radio" name="payment" checked={payment === 'cod'}
                   onChange={() => setPayment('cod')} />
            Thanh toán khi nhận hàng (COD)
          </label>
          <label>
            <input type="radio" name="payment" checked={payment === 'bank'}
                   onChange={() => setPayment('bank')} />
            Chuyển khoản ngân hàng
          </label>
        </div>

        <div className="cart-total">
          <h2>Tổng cộng: {totalPrice.toLocaleString('vi-VN')} đ</h2>
          {error && <p className="error">{error}</p>}
          <button type="button" className="btn secondary" onClick={clearCart}>Xóa hết</button>
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Đang đặt...' : 'Đặt hàng'}
          </button>
        </div>
      </form>
    </div>
  )
}
