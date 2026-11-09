const { Product } = require("./schemas");
const { nextId } = require("./counterModel");

// Thoát các ký tự đặc biệt của regex để từ khóa tìm kiếm không làm hỏng truy vấn
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const SORTS = {
  price_asc: { price: 1, id: 1 },
  price_desc: { price: -1, id: 1 },
  name_asc: { name: 1 },
  newest: { id: -1 },
};

exports.findAll = async ({ keyword, category, minPrice, maxPrice, sort, page = 1, limit = 0 } = {}) => {
  const filter = {};
  if (keyword) {
    const re = new RegExp(escapeRegex(keyword), "i");
    filter.$or = [{ name: re }, { category: re }];
  }
  if (category) filter.category = category;
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  const total = await Product.countDocuments(filter);
  let query = Product.find(filter).sort(SORTS[sort] || { id: 1 });
  if (limit) query = query.skip((page - 1) * limit).limit(limit);
  return { items: await query, total };
};

exports.findById = (id) => Product.findOne({ id });

exports.create = async (data) => {
  const id = await nextId("products", Product);
  return Product.create({ id, ...data });
};

exports.remove = (id) => Product.findOneAndDelete({ id });

// Trừ kho nguyên tử: điều kiện stock >= quantity nằm ngay trong lệnh cập nhật,
// nên hai đơn cùng lúc không thể trừ quá số hàng còn. Trả về false nếu không đủ hàng.
exports.reserveStock = async (productId, quantity) => {
  const updated = await Product.findOneAndUpdate(
    { id: productId, stock: { $gte: quantity } },
    { $inc: { stock: -quantity } },
    { new: true }
  );
  return Boolean(updated);
};

// Cộng lại kho (hủy đơn, hoặc hoàn tác khi đặt hàng giữa chừng bị lỗi)
exports.releaseStock = (productId, quantity) =>
  Product.updateOne({ id: productId }, { $inc: { stock: quantity } });
