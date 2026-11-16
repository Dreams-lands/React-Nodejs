const express = require("express");
const ProductController = require("../controllers/product.controller");
const { authenticate, requireRole } = require("../middlewares/auth");

const router = express.Router();

/**
 * Định tuyến Sản phẩm (Products)
 */
// Public: Tìm kiếm, lọc và xem chi tiết sản phẩm
router.get("/", ProductController.getProducts);
router.get("/:id", ProductController.getProductById);

// Admin / Staff: Quản trị sản phẩm và gallery ảnh
router.post("/", authenticate, requireRole("Admin", "Staff"), ProductController.createProduct);
router.put("/:id", authenticate, requireRole("Admin", "Staff"), ProductController.updateProduct);
router.delete("/:id", authenticate, requireRole("Admin"), ProductController.deleteProduct);

// Quản trị ảnh sản phẩm
router.post("/:id/images", authenticate, requireRole("Admin", "Staff"), ProductController.addImage);
router.delete("/images/:imageId", authenticate, requireRole("Admin", "Staff"), ProductController.deleteImage);

module.exports = router;
