const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");
const asyncHandler = require("../middleware/asyncHandler");

const VALID_STATUS = ["pending", "shipping", "done", "cancelled"];

// GET /api/admin/orders  (tất cả đơn, mới nhất lên đầu, kèm tên khách hàng)
exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await orderModel.findAll();

  // Lấy tất cả người dùng liên quan bằng một truy vấn, rồi tra theo id
  const userIds = [...new Set(orders.map((o) => o.userId))];
  const users = await userModel.findByIds(userIds);
  const userById = new Map(users.map((u) => [u.id, u]));

  const data = orders.map((o) => {
    const user = userById.get(o.userId);
    return {
      ...o.toJSON(),
      customerName: user ? user.name : null,
      customerEmail: user ? user.email : null,
    };
  });
  res.json({ success: true, data });
});

// PUT /api/admin/orders/:id   body: { status }
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUS.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Trạng thái không hợp lệ. Chỉ nhận: " + VALID_STATUS.join(", "),
    });
  }

  const id = Number(req.params.id);
  const order = Number.isInteger(id) ? await orderModel.updateStatus(id, status) : null;
  if (!order) {
    return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
  }
  res.json({ success: true, message: "Cập nhật trạng thái thành công", data: order });
});
