const express = require("express");
const session = require("express-session");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: "techstore-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 },
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

app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
