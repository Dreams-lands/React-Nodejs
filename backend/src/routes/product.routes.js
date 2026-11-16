const express = require("express");
const ProductController = require("../controllers/product.controller");

const router = express.Router();

/**
 * Định tuyến tài nguyên Product
 * [GET]    /api/products            - Lấy danh sách sản phẩm (phân trang + tìm kiếm)
 * [GET]    /api/products/low-stock  - Cảnh báo tồn kho thấp
 * [GET]    /api/products/:id        - Lấy thông tin sản phẩm theo ID
 * [POST]   /api/products            - Tạo sản phẩm mới
 * [PUT]    /api/products/:id        - Cập nhật sản phẩm
 * [DELETE] /api/products/:id        - Xóa sản phẩm
 */
router.get("/", ProductController.getProducts);
router.get("/low-stock", ProductController.getLowStock);
router.get("/:id", ProductController.getProductById);
router.post("/", ProductController.createProduct);
router.put("/:id", ProductController.updateProduct);
router.delete("/:id", ProductController.deleteProduct);

module.exports = router;
