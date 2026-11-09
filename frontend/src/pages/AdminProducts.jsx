import { useState, useEffect } from 'react'
import { confirmDialog } from '../toast'

const EMPTY = { name: '', category: '', price: '', stock: '', image: '', description: '' }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  function load() {
    fetch('/api/products')
      .then(res => res.json())
      .then(json => setProducts(json.data))
      .catch(() => setError('Không tải được sản phẩm'))
  }

  useEffect(load, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const url = editingId ? '/api/products/' + editingId : '/api/products'
    const res = await fetch(url, {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        stock: form.stock === '' ? 0 : Number(form.stock)
      })
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.message || 'Lưu thất bại')
      return
    }
    setForm(EMPTY)
    setEditingId(null)
    load()
  }

  function startEdit(p) {
    setEditingId(p.id)
    setForm({
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock ?? 0,
      image: p.image,
      description: p.description
    })
    window.scrollTo(0, 0)
  }

  async function handleDelete(p) {
    if (!(await confirmDialog('Xóa sản phẩm "' + p.name + '"?', 'Xóa', 'Hủy bỏ'))) return
    const res = await fetch('/api/products/' + p.id, {
      method: 'DELETE',
      credentials: 'include'
    })
    if (!res.ok) {
      const json = await res.json()
      setError(json.message || 'Xóa thất bại')
      return
    }
    load()
  }

  return (
    <div>
      <h1>Quản lý sản phẩm</h1>

      <form className="admin-form" onSubmit={handleSubmit}>
        <h3>{editingId ? 'Sửa sản phẩm #' + editingId : 'Thêm sản phẩm mới'}</h3>
        <input name="name" placeholder="Tên sản phẩm" value={form.name}
               onChange={handleChange} required />
        <input name="category" placeholder="Danh mục (Điện thoại, Laptop...)"
               value={form.category} onChange={handleChange} required />
        <input name="price" type="number" min="1" placeholder="Giá"
               value={form.price} onChange={handleChange} required />
        <input name="stock" type="number" min="0" max="100000" step="1"
               placeholder="Tồn kho (số lượng hiện có)"
               value={form.stock} onChange={handleChange} required />
        <input name="image" placeholder="Link ảnh (để trống thì tự tạo)"
               value={form.image} onChange={handleChange} />
        <textarea name="description" placeholder="Mô tả"
                  value={form.description} onChange={handleChange} />
        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit">
          {editingId ? 'Lưu thay đổi' : 'Thêm'}
        </button>
        {editingId && (
          <button className="btn secondary" type="button"
                  onClick={() => { setEditingId(null); setForm(EMPTY) }}>
            Hủy sửa
          </button>
        )}
      </form>

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>ID</th><th>Tên</th><th>Danh mục</th><th>Giá</th><th>Tồn kho</th><th></th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{Number(p.price).toLocaleString('vi-VN')} đ</td>
                <td className={Number(p.stock) > 0 ? '' : 'stock out'}>
                  {Number(p.stock) > 0 ? p.stock : 'Hết hàng'}
                </td>
                <td>
                  <button onClick={() => startEdit(p)}>Sửa</button>{' '}
                  <button className="remove" onClick={() => handleDelete(p)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}