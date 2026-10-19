const { Product } = require("./schemas");

// Thoát các ký tự đặc biệt của regex để từ khóa tìm kiếm không làm hỏng truy vấn
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.findAll = (keyword) => {
  const filter = {};
  if (keyword) {
    const re = new RegExp(escapeRegex(keyword), "i");
    filter.$or = [{ name: re }, { category: re }];
  }
  return Product.find(filter).sort({ id: 1 });
};

exports.findById = (id) => Product.findOne({ id });

exports.create = async (data) => {
  const last = await Product.findOne().sort({ id: -1 });
  return Product.create({ id: last ? last.id + 1 : 1, ...data });
};

exports.remove = (id) => Product.findOneAndDelete({ id });
