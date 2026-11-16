const OrderService = require("../services/order.service");
const { sendSuccess } = require("../utils/response");

/**
 * OrderController (Tầng Controller)
 * Quản lý quy trình đặt hàng, thanh toán và tra cứu đơn hàng
 */
class OrderController {
  /**
   * [POST] /api/orders - Đặt đơn hàng mới (Hỗ trợ cả Khách Đăng Nhập & Khách Vãng Lai)
   */
  static async createOrder(req, res, next) {
    try {
      const {
        buyer_name,
        buyer_phone,
        buyer_email,
        shipping_address,
        payment_method,
        discount_amount,
        final_amount,
        items,
        admin_notes,
      } = req.body;

      // Nếu đã đăng nhập, tự động lấy user_id từ token
      const customer_id = req.user ? req.user.user_id : req.body.customer_id || null;

      const order = await OrderService.createOrder({
        customer_id,
        buyer_name,
        buyer_phone,
        buyer_email,
        shipping_address,
        payment_method,
        discount_amount,
        final_amount,
        items,
        admin_notes,
      });

      return sendSuccess(res, order, "Đặt hàng thành công!", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/orders - Lấy danh sách đơn hàng
   * Khách hàng thông thường: Chỉ xem đơn của mình
   * Admin / Staff: Xem toàn bộ đơn hàng
   */
  static async getOrders(req, res, next) {
    try {
      const { status, search, limit, offset } = req.query;
      let customer_id = undefined;

      // Phân quyền theo vai trò
      if (req.user && req.user.role_name === "Customer") {
        customer_id = req.user.user_id;
      } else if (req.query.customer_id) {
        customer_id = Number(req.query.customer_id);
      }

      const orders = await OrderService.getAllOrders({
        customer_id,
        status,
        search,
        limit: limit ? Number(limit) : 50,
        offset: offset ? Number(offset) : 0,
      });

      return sendSuccess(res, orders, "Lấy danh sách đơn hàng thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/orders/lookup - Tra cứu đơn hàng theo Mã đơn và Số điện thoại (Không cần đăng nhập)
   */
  static async lookupOrder(req, res, next) {
    try {
      const { code, phone } = req.query;
      const order = await OrderService.lookupOrder(code, phone);
      return sendSuccess(res, order, "Tìm thấy thông tin đơn hàng");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/orders/stats - Thống kê doanh thu & đơn hàng (Dành cho Admin)
   */
  static async getStatistics(req, res, next) {
    try {
      const stats = await OrderService.getDashboardStats();
      return sendSuccess(res, stats, "Lấy thống kê đơn hàng thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/orders/:id - Lấy chi tiết một đơn hàng
   */
  static async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.user_id || null;
      const currentUserRole = req.user?.role_name || "Guest";

      const order = await OrderService.getOrderById(id, currentUserId, currentUserRole);
      return sendSuccess(res, order, "Lấy chi tiết đơn hàng thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [PUT] /api/orders/:id/status - Cập nhật trạng thái đơn hàng (Admin/Staff)
   */
  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, admin_notes } = req.body;
      const updated = await OrderService.updateStatus(id, status, admin_notes);
      return sendSuccess(res, updated, "Cập nhật trạng thái đơn hàng thành công");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OrderController;
