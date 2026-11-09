import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { showToast } from '../toast'

export default function Profile() {
  const { user, loading, updateProfile, changePassword } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [nameError, setNameError] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passError, setPassError] = useState('')

  if (loading) return <p>Đang tải...</p>
  if (!user) return <Navigate to="/login" />

  async function handleName(e) {
    e.preventDefault()
    setNameError('')
    try {
      await updateProfile(name.trim())
      showToast('Đã cập nhật tên!')
    } catch (err) {
      setNameError(err.message)
    }
  }

  async function handlePassword(e) {
    e.preventDefault()
    setPassError('')
    if (newPassword !== confirmPassword) {
      setPassError('Mật khẩu nhập lại không khớp')
      return
    }
    try {
      await changePassword(oldPassword, newPassword)
      showToast('Đổi mật khẩu thành công!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPassError(err.message)
    }
  }

  return (
    <div>
      <h1>Tài khoản</h1>

      <form className="admin-form" onSubmit={handleName}>
        <h3>Thông tin cá nhân</h3>
        <input value={user.email} disabled />
        <input placeholder="Họ tên" value={name} maxLength={50}
               onChange={e => setName(e.target.value)} required />
        {nameError && <p className="error">{nameError}</p>}
        <button className="btn" type="submit">Lưu tên</button>
      </form>

      <form className="admin-form" onSubmit={handlePassword}>
        <h3>Đổi mật khẩu</h3>
        <input type="password" placeholder="Mật khẩu hiện tại" value={oldPassword}
               onChange={e => setOldPassword(e.target.value)} required />
        <input type="password" placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
               value={newPassword} minLength={6}
               onChange={e => setNewPassword(e.target.value)} required />
        <input type="password" placeholder="Nhập lại mật khẩu mới"
               value={confirmPassword}
               onChange={e => setConfirmPassword(e.target.value)} required />
        {passError && <p className="error">{passError}</p>}
        <button className="btn" type="submit">Đổi mật khẩu</button>
      </form>
    </div>
  )
}