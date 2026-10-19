import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart()

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
        <button className="btn secondary" onClick={clearCart}>Xóa hết</button>
        <button className="btn">Đặt hàng</button>
      </div>
    </div>
  )
}