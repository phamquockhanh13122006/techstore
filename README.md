# TechStore – Website bán thiết bị điện tử

Bài tập lớn cuối kì: website bán thiết bị điện tử (điện thoại, laptop, máy tính bảng, phụ kiện).

- **Frontend:** React (Vite) + React Router
- **Backend:** Node.js + Express, xác thực bằng session (cookie), mật khẩu băm bằng bcryptjs
- **Cơ sở dữ liệu:** MongoDB (mongoose)

## Thành viên và phân công

| Thành viên | Vai trò | Phần việc |
|---|---|---|
| (Phạm Quốc Khánh) | Backend | API sản phẩm, đăng ký/đăng nhập, đặt hàng, hủy đơn |
| (Nguyễn Vũ Nam Khánh) | Frontend | Giao diện React, giỏ hàng, gọi API |
| (Phạm Việt Hưng) | Admin và tài liệu | API admin (quản lý sản phẩm, đơn hàng), README, tài liệu API |

## Chức năng chính

- Xem, tìm kiếm, lọc theo danh mục, sắp xếp và phân trang sản phẩm; xem chi tiết và tồn kho.
- Giỏ hàng (lưu trong trình duyệt), đặt hàng với thông tin giao hàng và phương thức thanh toán (COD hoặc chuyển khoản).
- Đăng ký, đăng nhập, đăng xuất, xem và hủy đơn của mình.
- Admin: thêm, sửa, xóa sản phẩm (kèm tồn kho); xem tất cả đơn và đổi trạng thái đơn.
- Kho hàng: đặt hàng thì trừ kho, hủy đơn thì hoàn kho.

## Cấu trúc thư mục

```
techstore/
├── backend/
│   ├── app.js
│   ├── seed.js        # nạp dữ liệu mẫu vào MongoDB
│   ├── config/        # kết nối database
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── data/          # dữ liệu mẫu (products.json)
├── frontend/
│   ├── public/images/ # ảnh sản phẩm
│   └── src/
│       ├── components/  # Navbar, AdminRoute
│       ├── context/     # AuthContext, CartContext
│       ├── pages/       # Home, ProductList, ProductDetail, Cart, Orders, Admin...
│       └── toast.js     # thông báo và hộp xác nhận
└── README.md
```

## Cài đặt và chạy

Yêu cầu: Node.js 18 trở lên và MongoDB.

### 1. Bật MongoDB

Cách dùng Docker (lần đầu):

```bash
docker run -d --name mongo -p 27017:27017 mongo:7
```

Những lần sau (container đã có sẵn):

```bash
docker start mongo
```

Hoặc dùng MongoDB Atlas và điền chuỗi kết nối `mongodb+srv://...` vào `MONGO_URI` bên dưới.

### 2. Backend

Tạo file `backend/.env` (có mẫu ở `backend/.env.example`):

```
MONGO_URI=mongodb://127.0.0.1:27017/techstore
SESSION_SECRET=một-chuỗi-bí-mật-bất-kỳ
CLIENT_ORIGIN=http://localhost:5173
```

- `SESSION_SECRET`: chuỗi bí mật để ký cookie session. Khi chạy thật (`NODE_ENV=production`) bắt buộc phải có.
- `CLIENT_ORIGIN`: địa chỉ frontend được phép gọi API, có thể điền nhiều địa chỉ cách nhau bằng dấu phẩy.

Cài đặt, nạp dữ liệu mẫu (chỉ cần làm lần đầu) và chạy:

```bash
cd backend
npm install
node seed.js
npm start
```

Server chạy tại `http://localhost:3000`. Thấy dòng `Server chạy tại http://localhost:3000` là thành công.

Lưu ý:
- `node seed.js` **xóa toàn bộ sản phẩm cũ** rồi nạp lại từ `data/products.json` (mỗi sản phẩm mẫu có tồn kho 20). Đừng chạy lại nếu đã chỉnh sản phẩm hoặc tồn kho.
- Server chỉ mở cổng sau khi kết nối MongoDB thành công. Nếu thấy `Lỗi kết nối MongoDB: ECONNREFUSED` thì MongoDB chưa chạy.
- Chỉ chạy **một** server tại một thời điểm. Nếu báo `EADDRINUSE` thì cổng 3000 đang có server khác chạy.

### 3. Frontend

Mở terminal thứ hai:

```bash
cd frontend
npm install
npm run dev
```

Mở địa chỉ Vite in ra (thường là `http://localhost:5173`). Vite chuyển mọi yêu cầu `/api` sang backend ở cổng 3000.

Mọi `fetch` gọi API cần đăng nhập phải có `credentials: "include"` thì cookie session mới được gửi đi.

## Tài khoản dùng để thử

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | admin@gmail.com | 123456 |
| Người dùng | tự đăng ký tại trang `/register` | tối thiểu 6 ký tự |

Tài khoản admin có `role: "admin"` trong database. Menu "QL sản phẩm" và "QL đơn hàng" chỉ hiện khi đăng nhập bằng tài khoản admin.

## Tài liệu API

Tất cả phản hồi có dạng `{ "success": true/false, "message": "...", "data": ... }`.

Quyền: **Công khai** = ai cũng gọi được, **Đăng nhập** = cần cookie session, **Admin** = cần tài khoản có `role: "admin"`.

### Sản phẩm

| Chức năng | Method và URL | Quyền | Gửi lên | Mã trả về |
|---|---|---|---|---|
| Danh sách (tìm kiếm, lọc, sắp xếp, phân trang) | `GET /api/products` | Công khai | query tùy chọn: `keyword`, `category`, `minPrice`, `maxPrice`, `sort`, `page`, `limit` | 200 |
| Chi tiết | `GET /api/products/:id` | Công khai | – | 200, 404 |
| Thêm sản phẩm | `POST /api/products` | Admin | `name`, `category`, `price` (và tùy chọn `image`, `description`, `stock`) | 201, 400, 401, 403 |
| Sửa sản phẩm | `PUT /api/products/:id` | Admin | các trường cần sửa, ví dụ `{ "price": 150000 }` | 200, 400, 404, 401, 403 |
| Xóa sản phẩm | `DELETE /api/products/:id` | Admin | – | 200, 404, 401, 403 |

Giá trị `sort` hợp lệ: `price_asc` (giá tăng dần), `price_desc` (giá giảm dần), `name_asc` (tên A-Z), `newest` (mới nhất). `limit` tối đa 100. Khi có `limit`, phản hồi kèm `total`, `page`, `totalPages`.

`stock` là số lượng tồn kho (số nguyên từ 0 đến 100000, mặc định 0). Sản phẩm có `stock` bằng 0 là hết hàng và không đặt được.

### Tài khoản

| Chức năng | Method và URL | Quyền | Gửi lên | Mã trả về |
|---|---|---|---|---|
| Đăng ký | `POST /api/auth/register` | Công khai | `name`, `email`, `password` | 201, 400 (thiếu dữ liệu, mật khẩu ngắn, email trùng) |
| Đăng nhập | `POST /api/auth/login` | Công khai | `email`, `password` | 200, 401 |
| Đăng xuất | `POST /api/auth/logout` | Công khai | – | 200 |
| Người dùng hiện tại | `GET /api/auth/me` | Đăng nhập | – | 200, 401 |
| Đổi tên | `PUT /api/auth/profile` | Đăng nhập | `name` (tối đa 50 ký tự) | 200, 400, 401 |
| Đổi mật khẩu | `PUT /api/auth/password` | Đăng nhập | `oldPassword`, `newPassword` (tối thiểu 6 ký tự, khác mật khẩu cũ) | 200, 400, 401 |

### Đơn hàng (người dùng)

| Chức năng | Method và URL | Quyền | Gửi lên | Mã trả về |
|---|---|---|---|---|
| Đặt hàng | `POST /api/orders` | Đăng nhập | `items: [{ productId, quantity }]`, `shippingAddress: { fullName, phone, address }`, `paymentMethod` (`cod` hoặc `bank`) | 201, 400, 401 |
| Đơn của tôi | `GET /api/orders` | Đăng nhập | – | 200, 401 |
| Hủy đơn | `PUT /api/orders/:id/cancel` | Đăng nhập | – | 200, 400, 401, 404 |

Quy tắc khi đặt hàng:
- Họ tên, số điện thoại, địa chỉ là bắt buộc. Số điện thoại phải đúng dạng Việt Nam (bắt đầu bằng `0` hoặc `+84`, sau đó 9 đến 10 chữ số). Họ tên tối đa 100 ký tự, địa chỉ tối đa 300 ký tự.
- Mỗi đơn tối đa 50 loại sản phẩm, mỗi loại tối đa 20 cái.
- Server kiểm tra tồn kho và trừ kho khi đặt hàng; hủy đơn thì hoàn kho.
- Giá và tổng tiền do **server** tính từ database, không tin giá do client gửi lên.
- Chỉ hủy được đơn đang ở trạng thái `pending`.

### Quản lý đơn hàng (admin)

| Chức năng | Method và URL | Quyền | Gửi lên | Mã trả về |
|---|---|---|---|---|
| Xem tất cả đơn (kèm tên và email khách) | `GET /api/admin/orders` | Admin | – | 200, 401, 403 |
| Đổi trạng thái đơn | `PUT /api/admin/orders/:id` | Admin | `{ "status": "shipping" }` | 200, 400, 404, 409, 401, 403 |

Các giá trị `status` hợp lệ: `pending` (chờ xử lý), `shipping` (đang giao), `done` (hoàn tất), `cancelled` (đã hủy). Giá trị khác trả về `400`.

Luồng trạng thái cho phép:
- `pending` chuyển được sang `shipping` hoặc `cancelled`.
- `shipping` chuyển được sang `done` hoặc `cancelled`.
- `done` và `cancelled` là trạng thái cuối, không đổi nữa. Chuyển sai luồng trả về `400`.

Nếu đơn vừa bị người khác đổi trạng thái thì trả về `409`, tải lại danh sách rồi thử lại. Hủy đơn thì hàng được hoàn về kho.

### Ý nghĩa mã trạng thái

| Mã | Ý nghĩa |
|---|---|
| 200 | Thành công |
| 201 | Tạo mới thành công |
| 400 | Dữ liệu gửi lên không hợp lệ |
| 401 | Chưa đăng nhập |
| 403 | Đã đăng nhập nhưng không phải admin |
| 404 | Không tìm thấy tài nguyên hoặc đường dẫn |
| 409 | Xung đột: dữ liệu vừa bị thay đổi bởi người khác |
| 500 | Lỗi server |

## Quy trình làm việc với Git

- Mỗi việc làm trên một nhánh riêng (ví dụ `backend-init`, `admin-api`, `frontend-cart`).
- Xong thì tạo Pull Request, một bạn khác xem rồi merge vào `main`.
- Không commit `node_modules/`, file `.env` hoặc `cookie.txt`.
