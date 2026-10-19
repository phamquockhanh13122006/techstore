const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");
const asyncHandler = require("../middleware/asyncHandler");

exports.createOrder = asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "Giỏ hàng trống" });
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
  });

  res.status(201).json({ success: true, message: "Đặt hàng thành công", data: order });
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderModel.findByUser(req.session.user.id);
  res.json({ success: true, data: orders });
});
