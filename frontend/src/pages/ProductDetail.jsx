import { useCart } from '../context/CartContext'
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

export default function ProductDetail() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    fetch('/api/products/' + id)
      .then(res => {
        if (!res.ok) throw new Error('not found')
        return res.json()
      })
      .then(json => {
        setProduct(json.data)
        setError('')
        setLoading(false)
      })
      .catch(() => {
        setError('Không tìm thấy sản phẩm.')
        setLoading(false)
      })
  }, [id])

  if (loading) return <p>Đang tải...</p>
  if (error) return (
    <div>
      <p className="error">{error}</p>
      <Link to="/products">← Quay lại danh sách</Link>
    </div>
  )

  return (
    <div>
      <Link to="/products">← Quay lại danh sách</Link>
      <div className="detail">
        <img src={product.image} alt={product.name} />
        <div className="info">
          <h1>{product.name}</h1>
          <p className="category">Danh mục: {product.category}</p>
          <p className="price big">{Number(product.price).toLocaleString('vi-VN')} đ</p>
          <p>{product.description}</p>
          <button className="btn" onClick={() => { addToCart(product); alert('Đã thêm vào giỏ hàng!') }}>
  Thêm vào giỏ hàng
</button>
        </div>
      </div>
    </div>
  )
}