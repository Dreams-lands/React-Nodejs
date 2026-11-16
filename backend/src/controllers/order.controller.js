const OrderService = require("../services/order.service");
const { sendSuccess } = require("../utils/response");

/**
 * OrderController (Tầng Controller trong MVC)
 * Tiếp nhận HTTP Request từ Route, xử lý và phản hồi HTTP Response
 */
class OrderController {
  /**
   * [GET] /api/orders - Lấy danh sách đơn hàng (phân trang, lọc status, tìm kiếm)
   */
  static async getOrders(req, res, next) {
    try {
      const result = await OrderService.getAllOrders(req.query);
      return sendSuccess(res, result, "Lấy danh sách đơn hàng thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/orders/pending - Lấy danh sách đơn hàng chờ duyệt
   */
  static async getPendingOrders(req, res, next) {
    try {
      const orders = await OrderService.getPendingOrders();
      return sendSuccess(res, orders, "Lấy danh sách đơn hàng chờ duyệt thành công");
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
      const order = await OrderService.getOrderById(id);
      return sendSuccess(res, order, "Lấy thông tin đơn hàng thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [POST] /api/orders - Tạo đơn hàng mới
   */
  static async createOrder(req, res, next) {
    try {
      const newOrder = await OrderService.createOrder(req.body);
      return sendSuccess(res, newOrder, "Tạo đơn hàng mới thành công", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [PATCH] /api/orders/:id/status - Cập nhật trạng thái đơn hàng (Duyệt đơn / Hủy đơn)
   */
  static async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, admin_notes } = req.body;
      const updatedOrder = await OrderService.updateOrderStatus(id, {
        status,
        admin_notes,
      });
      return sendSuccess(res, updatedOrder, `Cập nhật trạng thái đơn hàng thành ${status} thành công`);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OrderController;
