const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const asyncHandler = require("../middleware/asyncHandler");

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Thiếu name, email hoặc password" });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ success: false, message: "Mật khẩu tối thiểu 6 ký tự" });
  }
  if (await userModel.findByEmail(email)) {
    return res.status(400).json({ success: false, message: "Email đã được đăng ký" });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  await userModel.create({ name, email, passwordHash });
  res.status(201).json({ success: true, message: "Đăng ký thành công" });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = email && (await userModel.findByEmail(email));

  if (!user || !bcrypt.compareSync(String(password || ""), user.passwordHash)) {
    return res.status(401).json({ success: false, message: "Sai email hoặc mật khẩu" });
  }

  req.session.user = { id: user.id };
  res.json({ success: true, user: publicUser(user) });
});

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ success: true, message: "Đã đăng xuất" });
  });
};

exports.me = asyncHandler(async (req, res) => {
  const user = req.session.user && (await userModel.findById(req.session.user.id));
  if (!user) {
    return res.status(401).json({ success: false, message: "Bạn chưa đăng nhập" });
  }
  res.json({ success: true, user: publicUser(user) });
});
