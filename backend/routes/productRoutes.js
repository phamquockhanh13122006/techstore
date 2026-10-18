const express = require("express");
const router = express.Router();
const c = require("../controllers/productController");

router.get("/", c.getProducts);
router.get("/:id", c.getProductById);

module.exports = router;
