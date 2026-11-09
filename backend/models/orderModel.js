const { Order } = require("./schemas");
const { nextId } = require("./counterModel");

exports.create = async (order) => {
  const id = await nextId("orders", Order);
  return Order.create({ id, ...order });
};

// Đơn của một người dùng, mới nhất lên đầu
exports.findByUser = (userId) => Order.find({ userId }).sort({ id: -1 });

// ===== Dành cho admin =====
exports.findAll = () => Order.find().sort({ id: -1 });

exports.updateStatus = (id, status) =>
  Order.findOneAndUpdate({ id }, { status }, { new: true });
exports.findById = (id) => Order.findOne({ id });

// Đổi trạng thái nguyên tử: chỉ đổi nếu đơn vẫn đang ở trạng thái `from`.
// Trả về null nếu đơn đã bị ai đó đổi trước (tránh hoàn kho hai lần khi hủy).
exports.transition = (id, from, to) =>
  Order.findOneAndUpdate({ id, status: from }, { status: to }, { new: true });
