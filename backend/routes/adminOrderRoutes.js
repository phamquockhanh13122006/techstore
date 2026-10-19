const express = require("express");
const router = express.Router();
const c = require("../controllers/adminOrderController");
const { requireAdmin } = require("../middleware/requireLogin");

// Tất cả route trong file này chỉ dành cho admin
router.use(requireAdmin);

router.get("/", c.getAllOrders);
router.put("/:id", c.updateOrderStatus);

module.exports = router;