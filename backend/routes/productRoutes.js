const express = require("express");
const router = express.Router();
const c = require("../controllers/productController");
const { requireAdmin } = require("../middleware/requireLogin");

router.get("/", c.getProducts);
router.get("/:id", c.getProductById);

// Chỉ admin được thêm, sửa, xóa
router.post("/", requireAdmin, c.createProduct);
router.put("/:id", requireAdmin, c.updateProduct);
router.delete("/:id", requireAdmin, c.deleteProduct);

module.exports = router;