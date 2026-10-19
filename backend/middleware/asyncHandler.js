// Express 4 không tự bắt lỗi trong hàm async.
// Bọc hàm lại để mọi lỗi được chuyển sang middleware bắt lỗi ở app.js (trả 500).
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
