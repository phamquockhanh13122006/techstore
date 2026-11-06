const productModel = require("../models/productModel");
const asyncHandler = require("../middleware/asyncHandler");

// id trong URL không phải số nguyên thì coi như không tìm thấy (tránh lỗi ép kiểu của Mongoose)
const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
};

const notFound = (res) =>
  res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });

const toNumber = (v) => {
  if (v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

exports.getProducts = asyncHandler(async (req, res) => {
  const q = req.query;
  const limit = Math.min(Math.max(parseInt(q.limit) || 0, 0), 100);
  const page = Math.max(parseInt(q.page) || 1, 1);

  const { items, total } = await productModel.findAll({
    keyword: String(q.keyword || "").trim(),
    category: String(q.category || "").trim(),
    minPrice: toNumber(q.minPrice),
    maxPrice: toNumber(q.maxPrice),
    sort: q.sort,
    page,
    limit,
  });

  res.json({
    success: true,
    data: items,
    total,
    page,
    totalPages: limit ? Math.ceil(total / limit) : 1,
  });
});

exports.getProductById = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const product = id === null ? null : await productModel.findById(id);
  if (!product) return notFound(res);
  res.json({ success: true, data: product });
});

function checkFields(data, requireAll) {
  if (requireAll || data.name !== undefined) {
    if (typeof data.name !== "string" || !data.name.trim()) {
      return "Tên sản phẩm không được để trống";
    }
  }
  if (requireAll || data.category !== undefined) {
    if (typeof data.category !== "string" || !data.category.trim()) {
      return "Danh mục không được để trống";
    }
  }
  if (requireAll || data.price !== undefined) {
    const price = Number(data.price);
    if (!Number.isFinite(price) || price <= 0) {
      return "Giá phải là số lớn hơn 0";
    }
  }
  return null;
}

exports.createProduct = asyncHandler(async (req, res) => {
  const error = checkFields(req.body, true);
  if (error) {
    return res.status(400).json({ success: false, message: error });
  }

  const { name, category, price, image, description } = req.body;
  const product = await productModel.create({
    name: name.trim(),
    category: category.trim(),
    price: Number(price),
    image:
      image || "https://placehold.co/400x300?text=" + encodeURIComponent(name.trim()),
    description: description || "",
  });

  res.status(201).json({ success: true, message: "Thêm sản phẩm thành công", data: product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const product = id === null ? null : await productModel.findById(id);
  if (!product) return notFound(res);

  const error = checkFields(req.body, false);
  if (error) {
    return res.status(400).json({ success: false, message: error });
  }

  const { name, category, price, image, description } = req.body;
  if (name !== undefined) product.name = name.trim();
  if (category !== undefined) product.category = category.trim();
  if (price !== undefined) product.price = Number(price);
  if (image !== undefined) product.image = image;
  if (description !== undefined) product.description = description;

  await product.save();
  res.json({ success: true, message: "Cập nhật sản phẩm thành công", data: product });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const deleted = id === null ? null : await productModel.remove(id);
  if (!deleted) return notFound(res);
  res.json({ success: true, message: "Xóa sản phẩm thành công" });
});
