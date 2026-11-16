const express = require("express");
const DashboardController = require("../controllers/dashboard.controller");

const router = express.Router();

// GET /api/dashboard/stats - Thống kê tổng quan (4 thẻ KPI)
router.get("/stats", DashboardController.getOverviewStats);

// GET /api/dashboard/revenue-chart?year=2026 - Biểu đồ doanh thu theo tháng
router.get("/revenue-chart", DashboardController.getRevenueChart);

// GET /api/dashboard/daily-revenue?days=7 - Doanh thu hàng ngày
router.get("/daily-revenue", DashboardController.getDailyRevenue);

// GET /api/dashboard/top-products?limit=5 - Top sản phẩm bán chạy
router.get("/top-products", DashboardController.getTopProducts);

// GET /api/dashboard/payment-summary - Tổng hợp thanh toán
router.get("/payment-summary", DashboardController.getPaymentSummary);

// GET /api/dashboard/invoices?page=1&limit=10 - Danh sách hóa đơn (phân trang)
router.get("/invoices", DashboardController.getRecentInvoices);

module.exports = router;
