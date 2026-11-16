const DashboardModel = require("../models/dashboard.model");

/**
 * DashboardService (Tầng Service)
 * Chứa logic nghiệp vụ cho Dashboard: tính toán tăng trưởng, fill dữ liệu trống, phân trang
 */
class DashboardService {
  /**
   * Lấy thống kê tổng quan + tính % tăng trưởng doanh thu so với tháng trước
   */
  static async getOverviewStats() {
    const stats = await DashboardModel.getOverviewStats();

    // Tính % tăng trưởng doanh thu
    let revenueGrowth = 0;
    if (stats.lastMonthRevenue > 0) {
      revenueGrowth =
        ((stats.thisMonthRevenue - stats.lastMonthRevenue) /
          stats.lastMonthRevenue) *
        100;
    } else if (stats.thisMonthRevenue > 0) {
      // Tháng trước = 0, tháng này có doanh thu -> 100% tăng trưởng
      revenueGrowth = 100;
    }

    return {
      thisMonthRevenue: stats.thisMonthRevenue,
      lastMonthRevenue: stats.lastMonthRevenue,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100, // Làm tròn 2 chữ số thập phân
      pendingOrders: stats.pendingOrders,
      lowStockProducts: stats.lowStockProducts,
      totalCustomers: stats.totalCustomers,
    };
  }

  /**
   * Lấy biểu đồ doanh thu theo tháng, fill đủ 12 tháng (tháng trống = 0)
   * @param {number|string} year
   */
  static async getRevenueChart(year) {
    const parsedYear = parseInt(year, 10);
    if (!parsedYear || parsedYear < 2000 || parsedYear > 2100) {
      const error = new Error("Năm không hợp lệ (2000-2100)");
      error.statusCode = 400;
      throw error;
    }

    const rawData = await DashboardModel.getRevenueChart(parsedYear);

    // Tạo map từ dữ liệu thực
    const revenueMap = {};
    for (const row of rawData) {
      const monthIndex = new Date(row.month).getMonth(); // 0-11
      revenueMap[monthIndex] = parseFloat(row.revenue);
    }

    // Fill đủ 12 tháng
    const months = [
      "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
      "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
      "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
    ];

    const chart = months.map((label, index) => ({
      month: index + 1,
      label,
      revenue: revenueMap[index] || 0,
    }));

    return { year: parsedYear, chart };
  }

  /**
   * Lấy doanh thu hàng ngày, fill các ngày trống = 0
   * @param {number|string} days
   */
  static async getDailyRevenue(days) {
    const parsedDays = parseInt(days, 10) || 7;
    const rawData = await DashboardModel.getDailyRevenue(parsedDays);

    // Tạo map từ dữ liệu thực
    const dataMap = {};
    for (const row of rawData) {
      const dateStr = new Date(row.date).toISOString().split("T")[0];
      dataMap[dateStr] = {
        revenue: parseFloat(row.revenue),
        orderCount: parseInt(row.order_count, 10),
      };
    }

    // Fill các ngày trống
    const result = [];
    const today = new Date();
    for (let i = parsedDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      result.push({
        date: dateStr,
        revenue: dataMap[dateStr]?.revenue || 0,
        orderCount: dataMap[dateStr]?.orderCount || 0,
      });
    }

    return result;
  }

  /**
   * Lấy top sản phẩm bán chạy
   * @param {number|string} limit
   */
  static async getTopProducts(limit) {
    const parsedLimit = parseInt(limit, 10) || 5;
    const rows = await DashboardModel.getTopProducts(parsedLimit);
    return rows.map((row) => ({
      productName: row.product_name,
      totalSold: parseInt(row.total_sold, 10),
      totalRevenue: parseFloat(row.total_revenue),
    }));
  }

  /**
   * Lấy tổng hợp thanh toán + tính tổng chung và phần trăm từng phương thức
   */
  static async getPaymentSummary() {
    const rows = await DashboardModel.getPaymentSummary();

    const grandTotal = rows.reduce(
      (sum, row) => sum + parseFloat(row.total),
      0
    );

    const methods = rows.map((row) => {
      const total = parseFloat(row.total);
      return {
        paymentMethod: row.payment_method,
        total,
        count: parseInt(row.count, 10),
        percentage:
          grandTotal > 0
            ? Math.round((total / grandTotal) * 10000) / 100 // Làm tròn 2 chữ số
            : 0,
      };
    });

    return { grandTotal, methods };
  }

  /**
   * Lấy danh sách hóa đơn gần nhất (phân trang)
   * @param {Object} queryParams - { page, limit } từ req.query
   */
  static async getRecentInvoices(queryParams) {
    const page = Math.max(parseInt(queryParams.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(queryParams.limit, 10) || 10, 1), 100);

    const { rows, totalCount } = await DashboardModel.getRecentInvoices({
      page,
      limit,
    });

    return {
      invoices: rows,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }
}

module.exports = DashboardService;
