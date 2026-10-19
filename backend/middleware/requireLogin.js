const userModel = require("../models/userModel");

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Bạn chưa đăng nhập" });
  }
  next();
}

async function requireAdmin(req, res, next) {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "Bạn chưa đăng nhập" });
    }
    const user = await userModel.findById(req.session.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Chỉ admin được phép" });
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireLogin, requireAdmin };
