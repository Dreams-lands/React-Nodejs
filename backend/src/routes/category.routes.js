const express = require("express");
const CategoryController = require("../controllers/category.controller");

const router = express.Router();

/**
 * Định tuyến tài nguyên Category
 * [GET]    /api/categories      - Lấy danh sách danh mục
 * [GET]    /api/categories/:id  - Lấy thông tin danh mục theo ID
 * [POST]   /api/categories      - Tạo danh mục mới
 * [PUT]    /api/categories/:id  - Cập nhật danh mục
 * [DELETE] /api/categories/:id  - Xóa danh mục
 */
router.get("/", CategoryController.getCategories);
router.get("/:id", CategoryController.getCategoryById);
router.post("/", CategoryController.createCategory);
router.put("/:id", CategoryController.updateCategory);
router.delete("/:id", CategoryController.deleteCategory);

module.exports = router;
