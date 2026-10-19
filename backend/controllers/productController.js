const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../data/products.json");
const readAll = () => JSON.parse(fs.readFileSync(FILE, "utf8"));
const writeAll = (products) =>
  fs.writeFileSync(FILE, JSON.stringify(products, null, 2));

exports.getProducts = (req, res) => {
  const keyword = String(req.query.keyword || "").trim().toLowerCase();
  let products = readAll();
  if (keyword) {
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(keyword) ||
        p.category.toLowerCase().includes(keyword)
    );
  }
  res.json({ success: true, data: products });
};

exports.getProductById = (req, res) => {
  const product = readAll().find((p) => p.id === Number(req.params.id));
  if (!product) {
    return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
  }
  res.json({ success: true, data: product });
};

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

exports.createProduct = (req, res) => {
  const error = checkFields(req.body, true);
  if (error) {
    return res.status(400).json({ success: false, message: error });
  }

  const { name, category, price, image, description } = req.body;
  const products = readAll();
  const product = {
    id: products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1,
    name: name.trim(),
    category: category.trim(),
    price: Number(price),
    image:
      image || "https://placehold.co/400x300?text=" + encodeURIComponent(name.trim()),
    description: description || "",
  };
  products.push(product);
  writeAll(products);

  res.status(201).json({ success: true, message: "Thêm sản phẩm thành công", data: product });
};

exports.updateProduct = (req, res) => {
  const products = readAll();
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) {
    return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
  }

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

  writeAll(products);
  res.json({ success: true, message: "Cập nhật sản phẩm thành công", data: product });
};

exports.deleteProduct = (req, res) => {
  const products = readAll();
  const index = products.findIndex((p) => p.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
  }

  products.splice(index, 1);
  writeAll(products);
  res.json({ success: true, message: "Xóa sản phẩm thành công" });
};