const { pool } = require("../config/db");

/**
 * DashboardModel (Tầng Model)
 * Truy vấn trực tiếp PostgreSQL để lấy dữ liệu thống kê, báo cáo cho Dashboard
 */
class DashboardModel {
  /**
   * Lấy thống kê tổng quan: doanh thu tháng hiện tại & tháng trước, đơn chờ, sản phẩm sắp hết, tổng KH
   */
  static async getOverviewStats() {
    const [
      thisMonthRevenue,
      lastMonthRevenue,
      pendingOrders,
      lowStockProducts,
      totalCustomers,
    ] = await Promise.all([
      // Tổng doanh thu tháng hiện tại
      pool.query(`
        SELECT COALESCE(SUM(total_amount), 0) AS revenue
        FROM orders
        WHERE status = 'Completed'
          AND DATE_TRUNC('month', order_date) = DATE_TRUNC('month', CURRENT_DATE)
      `),
      // Tổng doanh thu tháng trước
      pool.query(`
        SELECT COALESCE(SUM(total_amount), 0) AS revenue
        FROM orders
        WHERE status = 'Completed'
          AND DATE_TRUNC('month', order_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
      `),
      // Số đơn chờ xác nhận
      pool.query(`
        SELECT COUNT(*) AS count
        FROM orders
        WHERE status = 'Pending'
      `),
      // Số sản phẩm sắp hết hàng (stock <= 15)
      pool.query(`
        SELECT COUNT(*) AS count
        FROM products
        WHERE stock_quantity <= 15
          AND is_active = TRUE
      `),
      // Tổng khách hàng (role_id = 3)
      pool.query(`
        SELECT COUNT(*) AS count
        FROM users
        WHERE role_id = 3
          AND is_active = TRUE
      `),
    ]);

    return {
      thisMonthRevenue: parseFloat(thisMonthRevenue.rows[0].revenue),
      lastMonthRevenue: parseFloat(lastMonthRevenue.rows[0].revenue),
      pendingOrders: parseInt(pendingOrders.rows[0].count, 10),
      lowStockProducts: parseInt(lowStockProducts.rows[0].count, 10),
      totalCustomers: parseInt(totalCustomers.rows[0].count, 10),
    };
  }

  /**
   * Lấy doanh thu theo từng tháng trong năm (biểu đồ cột/line)
   * @param {number} year - Năm cần lấy dữ liệu
   * @returns {Array} Mảng kết quả [{month, revenue}, ...]
   */
  static async getRevenueChart(year) {
    const { rows } = await pool.query(
      `SELECT DATE_TRUNC('month', order_date) AS month,
              SUM(total_amount) AS revenue
       FROM orders
       WHERE status = 'Completed'
         AND EXTRACT(YEAR FROM order_date) = $1
       GROUP BY month
       ORDER BY month`,
      [year]
    );
    return rows;
  }

  /**
   * Lấy doanh thu hàng ngày trong N ngày gần nhất
   * @param {number} days - Số ngày gần nhất (mặc định 7)
   * @returns {Array} [{date, revenue, order_count}, ...]
   */
  static async getDailyRevenue(days = 7) {
    const { rows } = await pool.query(
      `SELECT DATE(order_date) AS date,
              SUM(total_amount) AS revenue,
              COUNT(*) AS order_count
       FROM orders
       WHERE status IN ('Completed', 'Shipping')
         AND order_date >= CURRENT_DATE - $1 * INTERVAL '1 day'
       GROUP BY date
       ORDER BY date`,
      [days]
    );
    return rows;
  }

  /**
   * Lấy top sản phẩm bán chạy nhất
   * @param {number} limit - Số sản phẩm top (mặc định 5)
   * @returns {Array} [{product_name, total_sold, total_revenue}, ...]
   */
  static async getTopProducts(limit = 5) {
    const { rows } = await pool.query(
      `SELECT p.product_name,
              SUM(oi.quantity) AS total_sold,
              SUM(oi.quantity * oi.unit_price) AS total_revenue
       FROM order_items oi
       JOIN products p ON oi.product_id = p.product_id
       JOIN orders o ON oi.order_id = o.order_id
       WHERE o.status = 'Completed'
       GROUP BY p.product_id, p.product_name
       ORDER BY total_revenue DESC
       LIMIT $1`,
      [limit]
    );
    return rows;
  }

  /**
   * Lấy tổng hợp thanh toán theo phương thức
   * @returns {Array} [{payment_method, total, count}, ...]
   */
  static async getPaymentSummary() {
    const { rows } = await pool.query(
      `SELECT payment_method,
              SUM(amount) AS total,
              COUNT(*) AS count
       FROM transactions
       WHERE status = 'Success'
       GROUP BY payment_method`
    );
    return rows;
  }

  /**
   * Lấy danh sách hóa đơn (transactions) gần nhất, có phân trang
   * @param {Object} params
   * @param {number} params.page - Trang hiện tại
   * @param {number} params.limit - Số bản ghi mỗi trang
   * @returns {Object} { rows, totalCount }
   */
  static async getRecentInvoices({ page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;

    const [dataResult, countResult] = await Promise.all([
      pool.query(
        `SELECT t.*,
                o.buyer_name,
                o.buyer_phone,
                o.status AS order_status
         FROM transactions t
         JOIN orders o ON t.order_id = o.order_id
         ORDER BY t.transaction_date DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      pool.query(
        `SELECT COUNT(*) AS total
         FROM transactions t
         JOIN orders o ON t.order_id = o.order_id`
      ),
    ]);

    return {
      rows: dataResult.rows,
      totalCount: parseInt(countResult.rows[0].total, 10),
    };
  }
}

module.exports = DashboardModel;
