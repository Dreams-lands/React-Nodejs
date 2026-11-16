const express = require("express");
const OrderController = require("../controllers/order.controller");
const { authenticate, optionalAuth, requireRole } = require("../middlewares/auth");

const router = express.Router();

/**
 * Định tuyến Đơn hàng (Orders)
 */

// 1. Tra cứu đơn hàng theo Mã đơn và Số điện thoại (Public cho khách tra cứu)
router.get("/lookup", OrderController.lookupOrder);

// 2. Thống kê tổng quan đơn hàng (Dành cho Admin/Manager/Staff)
router.get("/stats", authenticate, requireRole("Admin", "Manager", "Staff"), OrderController.getStatistics);

// 3. Đặt đơn hàng mới (Hỗ trợ cả khách vãng lai và thành viên đã đăng nhập)
router.post("/", optionalAuth, OrderController.createOrder);

// 4. Lấy danh sách đơn hàng (User xem đơn của mình, Admin xem tất cả)
router.get("/", authenticate, OrderController.getOrders);

// 5. Lấy chi tiết đơn hàng
router.get("/:id", optionalAuth, OrderController.getOrderById);

// 6. Cập nhật trạng thái đơn hàng (Admin/Manager/Staff)
router.put("/:id/status", authenticate, requireRole("Admin", "Manager", "Staff"), OrderController.updateStatus);

module.exports = router;
