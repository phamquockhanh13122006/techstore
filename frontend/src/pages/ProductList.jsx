import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function ProductList() {
  const [products, setProducts] = useState([])
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    fetch('/api/products?keyword=' + encodeURIComponent(keyword))
      .then(res => res.json())
      .then(json => {
        setProducts(json.data)
        setError('')
        setLoading(false)
      })
      .catch(() => {
        setError('Không tải được sản phẩm. Backend đã chạy chưa?')
        setLoading(false)
      })
  }, [keyword])

  return (
    <div>
      <h1>Danh sách sản phẩm</h1>

      <input
        className="search"
        type="text"
        placeholder="Tìm sản phẩm theo tên..."
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
      />

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
    </div>
  )
}