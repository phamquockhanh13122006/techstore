import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const CATEGORIES = ['Điện thoại', 'Laptop', 'Máy tính bảng', 'Phụ kiện']
const LIMIT = 8

export default function ProductList() {
  const [products, setProducts] = useState([])
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (keyword) params.set('keyword', keyword)
    if (category) params.set('category', category)
    if (sort) params.set('sort', sort)
    params.set('page', page)
    params.set('limit', LIMIT)

    fetch('/api/products?' + params.toString())
      .then(res => res.json())
      .then(json => {
        setProducts(json.data)
        setTotalPages(json.totalPages)
        setError('')
        setLoading(false)
      })
      .catch(() => {
        setError('Không tải được sản phẩm. Backend đã chạy chưa?')
        setLoading(false)
      })
  }, [keyword, category, sort, page])

  function changeKeyword(e) { setKeyword(e.target.value); setPage(1) }
  function changeCategory(e) { setCategory(e.target.value); setPage(1) }
  function changeSort(e) { setSort(e.target.value); setPage(1) }

  return (
    <div>
      <h1>Danh sách sản phẩm</h1>

      <div className="filters">
        <input className="search" type="text" placeholder="Tìm sản phẩm theo tên..."
               value={keyword} onChange={changeKeyword} />
        <select value={category} onChange={changeCategory}>
          <option value="">Tất cả danh mục</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sort} onChange={changeSort}>
          <option value="">Mặc định</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
          <option value="name_asc">Tên A-Z</option>
          <option value="newest">Mới nhất</option>
        </select>
      </div>

      {loading && <p>Đang tải...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && products.length === 0 && <p>Không tìm thấy sản phẩm.</p>}

      <div className="grid">
        {products.map(p => (
          <div className="card" key={p.id}>
            <img src={p.image} alt={p.name} />
            <h3>{p.name}</h3>
            <p className="price">{Number(p.price).toLocaleString('vi-VN')} đ</p>
            <Link to={'/products/' + p.id}>Xem chi tiết</Link>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>← Trước</button>
          <span>Trang {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Sau →</button>
        </div>
      )}
    </div>
  )
}