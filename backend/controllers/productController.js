const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../data/products.json");
const readAll = () => JSON.parse(fs.readFileSync(FILE, "utf8"));

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
