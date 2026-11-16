const express = require("express");
const CategoryController = require("../controllers/category.controller");
const { authenticate, requireRole } = require("../middlewares/auth");

const router = express.Router();

/**
 * Định tuyến Danh mục sản phẩm (Categories)
 */
// Public: xem danh mục
router.get("/", CategoryController.getCategories);
router.get("/:id", CategoryController.getCategoryById);

// Admin / Staff: quản trị danh mục
router.post("/", authenticate, requireRole("Admin", "Staff"), CategoryController.createCategory);
router.put("/:id", authenticate, requireRole("Admin", "Staff"), CategoryController.updateCategory);
router.delete("/:id", authenticate, requireRole("Admin"), CategoryController.deleteCategory);

module.exports = router;
