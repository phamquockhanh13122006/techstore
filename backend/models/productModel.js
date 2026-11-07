const { Product } = require("./schemas");

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
  const last = await Product.findOne().sort({ id: -1 });
  return Product.create({ id: last ? last.id + 1 : 1, ...data });
};

exports.remove = (id) => Product.findOneAndDelete({ id });