import { NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { totalItems } = useCart()

  return (
    <nav className="navbar">
      <h2 className="logo">TechStore</h2>
      <div className="links">
        <NavLink to="/">Trang chủ</NavLink>
        <NavLink to="/products">Sản phẩm</NavLink>
        <NavLink to="/cart">Giỏ hàng ({totalItems})</NavLink>
        <NavLink to="/login">Đăng nhập</NavLink>
        <NavLink to="/register">Đăng ký</NavLink>
      </div>
    </nav>
  )
}