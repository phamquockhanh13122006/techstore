const fs = require("fs");
const path = require("path");
const orderModel = require("../models/orderModel");

const PRODUCTS_FILE = path.join(__dirname, "../data/products.json");

exports.createOrder = (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "Giỏ hàng trống" });
  }

  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf8"));
  const orderItems = [];
  let total = 0;

  for (const item of items) {
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ success: false, message: "Số lượng không hợp lệ" });
    }

    const product = products.find((p) => p.id === Number(item.productId));
    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: `Sản phẩm ${item.productId} không tồn tại` });
    }

    orderItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
    });
    total += product.price * quantity;
  }

  const order = orderModel.create({
    userId: req.session.user.id,
    items: orderItems,
    total,
    status: "pending",
  });

  res.status(201).json({ success: true, message: "Đặt hàng thành công", data: order });
};

exports.getMyOrders = (req, res) => {
  const orders = orderModel.findByUser(req.session.user.id);
  res.json({ success: true, data: orders });
};
