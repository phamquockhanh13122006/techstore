import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await register(name, email, password)
      alert('Đăng ký thành công, hãy đăng nhập!')
      navigate('/login')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-box">
      <h1>Đăng ký</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Họ tên" value={name}
               onChange={e => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email}
               onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Mật khẩu (tối thiểu 6 ký tự)" value={password}
               onChange={e => setPassword(e.target.value)} required />
        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit">Đăng ký</button>
      </form>
      <p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
    </div>
  )
}