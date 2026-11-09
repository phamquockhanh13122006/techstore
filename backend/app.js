require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const connectMongo = require("connect-mongo");
const MongoStore = connectMongo.MongoStore || connectMongo.default || connectMongo;

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";
if (!process.env.SESSION_SECRET) {
  if (isProd) {
    console.error("Thiếu SESSION_SECRET trong .env");
    process.exit(1);
  }
  console.warn("Cảnh báo: chưa có SESSION_SECRET, đang dùng secret mặc định (chỉ dùng khi phát triển)");
}
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "techstore-dev-only-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { httpOnly: true, sameSite: "lax", secure: isProd, maxAge: 1000 * 60 * 60 * 24 },
  })
);

app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/admin/orders", require("./routes/adminOrderRoutes"));

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Không tìm thấy" });
});
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "JSON gửi lên không hợp lệ" });
  }
  console.error(err);
  res.status(500).json({ success: false, message: "Lỗi server" });
});


const connectDB = require("./config/db");

connectDB()
  .then(() => app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`)))
  .catch((err) => {
    console.error("Lỗi kết nối MongoDB:", err.message);
    process.exit(1);
  });
