const express = require("express");
const router = express.Router();
const { getProducts, getProductById, getProductImage } = require("./products.controller");

router.get("/", getProducts);
router.get("/:id/image", getProductImage);
router.get("/:id", getProductById);

module.exports = router;
