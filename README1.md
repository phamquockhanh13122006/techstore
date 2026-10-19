# TechStore – Website bán thiết bị điện tử

Bài tập lớn cuối kì: website bán thiết bị điện tử (điện thoại, laptop, phụ kiện).

- **Frontend:** React (Vite) + React Router
- **Backend:** Node.js + Express, xác thực bằng session (cookie), mật khẩu băm bằng bcryptjs
- **Lưu trữ dữ liệu:** file JSON trong `backend/data/`

## Thành viên và phân công

| Thành viên | Vai trò | Phần việc |
|---|---|---|
| (Người 1) | Backend | API sản phẩm, đăng ký/đăng nhập, đặt hàng |
| (Người 2) | Frontend | Giao diện React, giỏ hàng, gọi API |
| (Người 3) | Admin và tài liệu | API admin (quản lý sản phẩm, đơn hàng), README, tài liệu API |

> Thay phần trong ngoặc bằng họ tên và MSSV của từng bạn.

## Cấu trúc thư mục

```
techstore/
├── backend/
│   ├── app.js
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── data/          # products.json, users.json, orders.json
├── frontend/
└── README.md
```

## Cài đặt và chạy

Yêu cầu: Node.js 18 trở lên.

### Backend

```bash
cd backend
npm install
npm run dev
```

Server chạy tại `http://localhost:3000`. Nếu thấy dòng `Server chạy tại http://localhost:3000` là thành công.

Lưu ý:
- Chỉ chạy **một** server tại một thời điểm. Nếu báo `EADDRINUSE` thì cổng 3000 đang có server khác chạy.
- Thư mục `data/` đã được `nodemon.json` loại khỏi danh sách theo dõi, để server không tự khởi động lại (làm mất đăng nhập) mỗi khi có đơn hàng mới.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Mọi `fetch` gọi API cần đăng nhập phải có `credentials: "include"` thì cookie session mới được gửi đi.

## Tài khoản dùng để thử

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | admin@gmail.com | 123456 |
| Người dùng | tự đăng ký qua `/api/auth/register` | tối thiểu 6 ký tự |

Tài khoản admin có `role: "admin"` trong `backend/data/users.json`.

## Tài liệu API

Tất cả phản hồi có dạng `{ "success": true/false, "message": "...", "data": ... }`.

Quyền: **Công khai** = ai cũng gọi được, **Đăng nhập** = cần cookie session, **Admin** = cần tài khoản có `role: "admin"`.

### Sản phẩm

| Chức năng | Method và URL | Quyền | Gửi lên | Mã trả về |
|---|---|---|---|---|
| Danh sách (có tìm kiếm) | `GET /api/products?keyword=` | Công khai | – | 200 |
| Chi tiết | `GET /api/products/:id` | Công khai | – | 200, 404 |
| Thêm sản phẩm | `POST /api/products` | Admin | `name`, `category`, `price` (và các trường tùy chọn như `image`, `description`) | 201, 400, 401, 403 |
| Sửa sản phẩm | `PUT /api/products/:id` | Admin | các trường cần sửa, ví dụ `{ "price": 150000 }` | 200, 400, 404, 401, 403 |
| Xóa sản phẩm | `DELETE /api/products/:id` | Admin | – | 200, 404, 401, 403 |

### Tài khoản

| Chức năng | Method và URL | Quyền | Gửi lên | Mã trả về |
|---|---|---|---|---|
| Đăng ký | `POST /api/auth/register` | Công khai | `name`, `email`, `password` | 201, 400 (thiếu dữ liệu, mật khẩu ngắn, email trùng) |
| Đăng nhập | `POST /api/auth/login` | Công khai | `email`, `password` | 200, 401 |
| Đăng xuất | `POST /api/auth/logout` | Công khai | – | 200 |
| Người dùng hiện tại | `GET /api/auth/me` | Đăng nhập | – | 200, 401 |

### Đơn hàng (người dùng)

| Chức năng | Method và URL | Quyền | Gửi lên | Mã trả về |
|---|---|---|---|---|
| Đặt hàng | `POST /api/orders` | Đăng nhập | `items: [{ productId, quantity }]` | 201, 400, 401 |
| Đơn của tôi | `GET /api/orders` | Đăng nhập | – | 200, 401 |

Giá và tổng tiền do **server** tính từ `products.json`, không tin giá do client gửi lên.

### Quản lý đơn hàng (admin)

| Chức năng | Method và URL | Quyền | Gửi lên | Mã trả về |
|---|---|---|---|---|
| Xem tất cả đơn | `GET /api/admin/orders` | Admin | – | 200, 401, 403 |
| Đổi trạng thái đơn | `PUT /api/admin/orders/:id` | Admin | `{ "status": "shipping" }` | 200, 400 (trạng thái sai), 404, 401, 403 |

Các giá trị `status` hợp lệ: `pending` (chờ xử lý), `shipping` (đang giao), `done` (hoàn tất), `cancelled` (đã hủy). Giá trị khác trả về `400`.

### Ý nghĩa mã trạng thái

| Mã | Ý nghĩa |
|---|---|
| 200 | Thành công |
| 201 | Tạo mới thành công |
| 400 | Dữ liệu gửi lên không hợp lệ |
| 401 | Chưa đăng nhập |
| 403 | Đã đăng nhập nhưng không phải admin |
| 404 | Không tìm thấy tài nguyên hoặc đường dẫn |

## Quy trình làm việc với Git

- Mỗi việc làm trên một nhánh riêng (ví dụ `backend-init`, `admin-api`, `frontend-cart`).
- Xong thì tạo Pull Request, một bạn khác xem rồi merge vào `main`.
- Không commit `node_modules/`, file `cookie.txt` hoặc dữ liệu thử trong `backend/data/`.
