const express = require("express");
const OrderController = require("../controllers/order.controller");
const { verifyToken, authorize } = require("../middlewares/auth");

const router = express.Router();

/**
 * Định tuyến tài nguyên Order
 * [GET]    /api/orders          - Lấy danh sách đơn hàng (Admin/Staff)
 * [GET]    /api/orders/pending  - Lấy đơn hàng chờ duyệt (Admin/Staff)
 * [GET]    /api/orders/:id      - Lấy chi tiết một đơn hàng
 * [POST]   /api/orders          - Tạo đơn hàng mới (Public hoặc Khách)
 * [PATCH]  /api/orders/:id/status - Cập nhật trạng thái / duyệt đơn (Admin/Staff)
 */
router.get("/pending", OrderController.getPendingOrders);
router.get("/", OrderController.getOrders);
router.get("/:id", OrderController.getOrderById);
router.post("/", OrderController.createOrder);
router.patch("/:id/status", OrderController.updateOrderStatus);

module.exports = router;
