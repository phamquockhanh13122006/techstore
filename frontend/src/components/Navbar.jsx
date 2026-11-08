import { NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { totalItems } = useCart()
  const { user, logout } = useAuth()

  return (
    <nav className="navbar">
      <h2 className="logo">TechStore</h2>
      <div className="links">
        <NavLink to="/">Trang chủ</NavLink>
        <NavLink to="/products">Sản phẩm</NavLink>
        <NavLink to="/cart">Giỏ hàng ({totalItems})</NavLink>
        {user ? (
          <>
          {user.role === 'admin' && <NavLink to="/admin/orders">QL đơn hàng</NavLink>}
            <NavLink to="/orders">Đơn hàng</NavLink>
            <span className="hello">Xin chào, {user.name}</span>
            <a href="#" onClick={e => { e.preventDefault(); logout() }}>Đăng xuất</a>
          </>
        ) : (
          <>
            <NavLink to="/login">Đăng nhập</NavLink>
            <NavLink to="/register">Đăng ký</NavLink>
          </>
        )}
      </div>
    </nav>
  )
}