const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const asyncHandler = require("../middleware/asyncHandler");

const VALID_STATUS = ["pending", "shipping", "done", "cancelled"];

// Luồng trạng thái hợp lệ:
//   pending  -> shipping | cancelled
//   shipping -> done | cancelled
//   done, cancelled: trạng thái cuối, không đổi nữa
const TRANSITIONS = {
  pending: ["shipping", "cancelled"],
  shipping: ["done", "cancelled"],
  done: [],
  cancelled: [],
};

const LABELS = {
  pending: "Chờ xử lý",
  shipping: "Đang giao",
  done: "Hoàn tất",
  cancelled: "Đã hủy",
};

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
// Chỉ cho đi theo luồng: pending -> shipping -> done, và pending/shipping -> cancelled.
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUS.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Trạng thái không hợp lệ. Chỉ nhận: " + VALID_STATUS.join(", "),
    });
  }

  const id = Number(req.params.id);
  const order = Number.isInteger(id) ? await orderModel.findById(id) : null;
  if (!order) {
    return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
  }

  if (order.status === status) {
    return res.status(400).json({ success: false, message: "Đơn hàng đã ở trạng thái này" });
  }
  if (!(TRANSITIONS[order.status] || []).includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Không thể chuyển đơn từ ${LABELS[order.status]} sang ${LABELS[status]}`,
    });
  }

  // Đổi nguyên tử: chỉ đổi nếu đơn vẫn ở trạng thái vừa đọc. Nếu có người đổi trước thì dừng,
  // để không hoàn kho hai lần khi hai người cùng bấm hủy.
  const updated = await orderModel.transition(id, order.status, status);
  if (!updated) {
    return res.status(409).json({
      success: false,
      message: "Đơn vừa được thay đổi bởi người khác, hãy tải lại danh sách",
    });
  }

  // Hủy đơn thì trả hàng về kho
  if (status === "cancelled") {
    for (const it of updated.items) {
      await productModel.releaseStock(it.productId, it.quantity);
    }
  }
  res.json({ success: true, message: "Cập nhật trạng thái thành công", data: updated });
});
