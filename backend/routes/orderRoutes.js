const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middleware/requireLogin");
const c = require("../controllers/orderController");

router.post("/", requireLogin, c.createOrder);
router.get("/", requireLogin, c.getMyOrders);
router.put("/:id/cancel", requireLogin, c.cancelOrder);

module.exports = router;
