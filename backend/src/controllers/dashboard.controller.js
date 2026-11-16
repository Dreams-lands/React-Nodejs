const DashboardService = require("../services/dashboard.service");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * DashboardController (Tầng Controller)
 * Tiếp nhận HTTP Request, gọi DashboardService và trả về HTTP Response
 */
class DashboardController {
  /**
   * [GET] /api/dashboard/stats
   * Lấy thống kê tổng quan (4 thẻ KPI)
   */
  static async getOverviewStats(req, res, next) {
    try {
      const stats = await DashboardService.getOverviewStats();
      return sendSuccess(res, stats, "Lấy thống kê tổng quan thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/dashboard/revenue-chart?year=2026
   * Lấy biểu đồ doanh thu theo tháng trong năm
   */
  static async getRevenueChart(req, res, next) {
    try {
      const { year } = req.query;
      const data = await DashboardService.getRevenueChart(
        year || new Date().getFullYear()
      );
      return sendSuccess(res, data, "Lấy biểu đồ doanh thu thành công");
    } catch (error) {
      if (error.statusCode) {
        return sendError(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  /**
   * [GET] /api/dashboard/daily-revenue?days=7
   * Lấy doanh thu hàng ngày trong N ngày gần nhất
   */
  static async getDailyRevenue(req, res, next) {
    try {
      const { days } = req.query;
      const data = await DashboardService.getDailyRevenue(days || 7);
      return sendSuccess(res, data, "Lấy doanh thu hàng ngày thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/dashboard/top-products?limit=5
   * Lấy top sản phẩm bán chạy nhất
   */
  static async getTopProducts(req, res, next) {
    try {
      const { limit } = req.query;
      const data = await DashboardService.getTopProducts(limit || 5);
      return sendSuccess(res, data, "Lấy top sản phẩm thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/dashboard/payment-summary
   * Lấy tổng hợp thanh toán theo phương thức
   */
  static async getPaymentSummary(req, res, next) {
    try {
      const data = await DashboardService.getPaymentSummary();
      return sendSuccess(res, data, "Lấy tổng hợp thanh toán thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/dashboard/invoices?page=1&limit=10
   * Lấy danh sách hóa đơn thanh toán (phân trang)
   */
  static async getRecentInvoices(req, res, next) {
    try {
      const data = await DashboardService.getRecentInvoices(req.query);
      return sendSuccess(res, data, "Lấy danh sách hóa đơn thành công");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;
