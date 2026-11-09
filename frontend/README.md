# TechStore - Frontend

Giao diện web của TechStore, viết bằng React (Vite) và React Router.

## Chạy

```bash
npm install
npm run dev
```

Mở địa chỉ Vite in ra (thường là `http://localhost:5173`). Backend phải chạy ở cổng 3000, vì `vite.config.js` chuyển mọi yêu cầu `/api` sang `http://localhost:3000`.

Các lệnh khác:

```bash
npm run build    # đóng gói bản chạy thật
npm run lint     # kiểm tra lỗi code
```

## Cấu trúc `src/`

| Thư mục / file | Nội dung |
|---|---|
| `pages/` | Các trang: Home, ProductList, ProductDetail, Cart, Login, Register, Orders, AdminProducts, AdminOrders |
| `components/` | Navbar, AdminRoute (chặn người không phải admin) |
| `context/` | AuthContext (đăng nhập), CartContext (giỏ hàng, lưu trong localStorage) |
| `toast.js` | Thông báo `showToast` và hộp xác nhận `confirmDialog` |
| `index.css` | Toàn bộ CSS của trang |

Xem hướng dẫn cài đặt toàn dự án và tài liệu API ở `README.md` ngoài thư mục gốc.