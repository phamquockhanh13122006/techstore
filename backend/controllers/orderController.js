const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");
const asyncHandler = require("../middleware/asyncHandler");

exports.createOrder = asyncHandler(async (req, res) => {
    const { items, shippingAddress, paymentMethod } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "Giỏ hàng trống" });
  }
    // Địa chỉ và thanh toán: chưa bắt buộc, nhưng nếu gửi lên thì phải hợp lệ
  let cleanAddress;
  if (shippingAddress !== undefined) {
    const { fullName, phone, address } = shippingAddress || {};
    const ok = [fullName, phone, address].every((v) => typeof v === "string" && v.trim());
    if (!ok) {
      return res.status(400).json({
        success: false,
        message: "Thiếu họ tên, số điện thoại hoặc địa chỉ giao hàng",
      });
    }
    if (!/^(0|\+84)\d{9,10}$/.test(phone.trim())) {
      return res.status(400).json({ success: false, message: "Số điện thoại không hợp lệ" });
    }
    cleanAddress = { fullName: fullName.trim(), phone: phone.trim(), address: address.trim() };
  }

  if (paymentMethod !== undefined && !["cod", "bank"].includes(paymentMethod)) {
    return res.status(400).json({ success: false, message: "Phương thức thanh toán không hợp lệ" });
  }

  const orderItems = [];
  let total = 0;

  for (const item of items) {
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ success: false, message: "Số lượng không hợp lệ" });
    }

    const productId = Number(item.productId);
    const product = Number.isInteger(productId)
      ? await productModel.findById(productId)
      : null;
    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: `Sản phẩm ${item.productId} không tồn tại` });
    }

    // Giá lấy từ database, không tin giá client gửi lên
    orderItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
    });
    total += product.price * quantity;
  }
  const order = await orderModel.create({
    userId: req.session.user.id,
    items: orderItems,
    total,
    status: "pending",
    ...(cleanAddress && { shippingAddress: cleanAddress }),
    ...(paymentMethod && { paymentMethod }),
  });
  res.status(201).json({ success: true, message: "Đặt hàng thành công", data: order });
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderModel.findByUser(req.session.user.id);
  res.json({ success: true, data: orders });
});
exports.cancelOrder = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const order = Number.isInteger(id) ? await orderModel.findById(id) : null;

  // Không phải đơn của mình thì coi như không tồn tại
  if (!order || order.userId !== req.session.user.id) {
    return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
  }

  if (order.status !== "pending") {
    return res.status(400).json({
      success: false,
      message: "Chỉ hủy được đơn đang chờ xử lý",
    });
  }

  order.status = "cancelled";
  await order.save();
  res.json({ success: true, message: "Đã hủy đơn hàng", data: order });
});
