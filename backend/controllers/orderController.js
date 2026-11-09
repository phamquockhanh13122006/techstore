const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");
const asyncHandler = require("../middleware/asyncHandler");

const MAX_QTY_PER_ITEM = 20; // tối đa mỗi loại sản phẩm trong một đơn
const MAX_LINES = 50; // tối đa số loại sản phẩm khác nhau trong một đơn

// Trả kho lại cho các dòng hàng của một đơn
async function releaseItems(items) {
  for (const it of items) {
    await productModel.releaseStock(it.productId, it.quantity);
  }
}

exports.createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "Giỏ hàng trống" });
  }
  if (items.length > MAX_LINES) {
    return res.status(400).json({
      success: false,
      message: `Mỗi đơn tối đa ${MAX_LINES} loại sản phẩm`,
    });
  }

  // Địa chỉ giao hàng và phương thức thanh toán là bắt buộc
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
  if (fullName.trim().length > 100 || address.trim().length > 300) {
    return res.status(400).json({
      success: false,
      message: "Họ tên tối đa 100 ký tự, địa chỉ tối đa 300 ký tự",
    });
  }
  if (!["cod", "bank"].includes(paymentMethod)) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng chọn phương thức thanh toán hợp lệ (cod hoặc bank)",
    });
  }
  const cleanAddress = {
    fullName: fullName.trim(),
    phone: phone.trim(),
    address: address.trim(),
  };

  // Gộp các dòng trùng sản phẩm và kiểm tra số lượng
  const wanted = new Map(); // productId -> quantity
  for (const item of items) {
    const quantity = Number(item && item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ success: false, message: "Số lượng không hợp lệ" });
    }
    const productId = Number(item && item.productId);
    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        success: false,
        message: `Sản phẩm ${item && item.productId} không tồn tại`,
      });
    }
    const merged = (wanted.get(productId) || 0) + quantity;
    if (merged > MAX_QTY_PER_ITEM) {
      return res.status(400).json({
        success: false,
        message: `Mỗi sản phẩm chỉ được mua tối đa ${MAX_QTY_PER_ITEM} cái mỗi đơn`,
      });
    }
    wanted.set(productId, merged);
  }

  // Giá lấy từ database, không tin giá client gửi lên.
  // Kiểm tra tồn kho sơ bộ ở bước này để báo lỗi rõ ràng cho khách.
  const orderItems = [];
  let total = 0;
  for (const [productId, quantity] of wanted) {
    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: `Sản phẩm ${productId} không tồn tại` });
    }
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message:
          product.stock > 0
            ? `${product.name} chỉ còn ${product.stock} sản phẩm`
            : `${product.name} đã hết hàng`,
      });
    }
    orderItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
    });
    total += product.price * quantity;
  }

  // Trừ kho từng sản phẩm. Điều kiện stock >= quantity nằm trong chính lệnh cập nhật,
  // nên nếu có người mua hết hàng ngay lúc này thì lệnh thất bại và ta hoàn lại những gì đã trừ.
  const reserved = [];
  for (const it of orderItems) {
    const reservedOk = await productModel.reserveStock(it.productId, it.quantity);
    if (!reservedOk) {
      await releaseItems(reserved);
      return res.status(400).json({
        success: false,
        message: `${it.name} vừa hết hàng hoặc không đủ số lượng`,
      });
    }
    reserved.push(it);
  }

  let order;
  try {
    order = await orderModel.create({
      userId: req.session.user.id,
      items: orderItems,
      total,
      status: "pending",
      shippingAddress: cleanAddress,
      paymentMethod,
    });
  } catch (err) {
    await releaseItems(reserved); // không tạo được đơn thì trả hàng lại kho
    throw err;
  }
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

  // Đổi trạng thái nguyên tử: chỉ một yêu cầu hủy thành công, nên kho chỉ được hoàn một lần
  const cancelled = await orderModel.transition(id, "pending", "cancelled");
  if (!cancelled) {
    return res.status(400).json({
      success: false,
      message: "Chỉ hủy được đơn đang chờ xử lý",
    });
  }
  await releaseItems(cancelled.items);
  res.json({ success: true, message: "Đã hủy đơn hàng", data: cancelled });
});
