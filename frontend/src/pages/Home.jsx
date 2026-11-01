import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(json => setFeatured(json.data.slice(0, 8)))
      .catch(() => setError('Không tải được sản phẩm nổi bật.'))
  }, [])

  return (
    <div>
      <section className="banner">
        <h1>Chào mừng đến với TechStore</h1>
        <p>Điện thoại, laptop, máy tính bảng và phụ kiện chính hãng, giá tốt mỗi ngày.</p>
        <Link to="/products" className="btn">Mua sắm ngay</Link>
      </section>

      <h2>Sản phẩm nổi bật</h2>
      {error && <p className="error">{error}</p>}

      <div className="grid">
        {featured.map(p => (
          <div className="card" key={p.id}>
            <img src={p.image} alt={p.name} />
            <h3>{p.name}</h3>
            <p className="price">{Number(p.price).toLocaleString('vi-VN')} đ</p>
            <Link to={'/products/' + p.id}>Xem chi tiết</Link>
          </div>
        ))}
      </div>

      <p className="see-all"><Link to="/products">Xem tất cả sản phẩm →</Link></p>
    </div>
  )
}