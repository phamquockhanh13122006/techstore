const { Order } = require("./schemas");

exports.create = async (order) => {
  const last = await Order.findOne().sort({ id: -1 });
  return Order.create({ id: last ? last.id + 1 : 1, ...order });
};

// Đơn của một người dùng, mới nhất lên đầu
exports.findByUser = (userId) => Order.find({ userId }).sort({ id: -1 });

// ===== Dành cho admin =====
exports.findAll = () => Order.find().sort({ id: -1 });

exports.updateStatus = (id, status) =>
  Order.findOneAndUpdate({ id }, { status }, { new: true });
