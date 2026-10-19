const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");

const VALID_STATUS = ["pending", "shipping", "done", "cancelled"];

// GET /api/admin/orders  (tất cả đơn, mới nhất lên đầu, kèm tên khách hàng)
exports.getAllOrders = (req, res) => {
  const orders = orderModel.findAll().map((o) => {
    const user = userModel.findById(o.userId);
    return {
      ...o,
      customerName: user ? user.name : null,
      customerEmail: user ? user.email : null,
    };
  });
  res.json({ success: true, data: orders });
};

// PUT /api/admin/orders/:id   body: { status }
exports.updateOrderStatus = (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUS.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Trạng thái không hợp lệ. Chỉ nhận: " + VALID_STATUS.join(", "),
    });
  }

  const order = orderModel.updateStatus(req.params.id, status);
  if (!order) {
    return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
  }
  res.json({ success: true, message: "Cập nhật trạng thái thành công", data: order });
};