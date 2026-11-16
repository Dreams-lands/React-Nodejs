const OrderModel = require("../models/order.model");
const { query } = require("../config/db");

/**
 * OrderService (Tầng Service trong kiến trúc MVC mở rộng)
 * Chứa logic nghiệp vụ đơn hàng, kiểm tra ràng buộc trước khi gọi Model
 */

// Thứ tự trạng thái hợp lệ (dùng để kiểm tra chuyển trạng thái)
const STATUS_ORDER = ["Pending", "Confirmed", "Shipping", "Completed", "Cancelled"];
const VALID_STATUSES = new Set(STATUS_ORDER);

class OrderService {
  /**
   * Lấy danh sách đơn hàng (phân trang, lọc, tìm kiếm)
   */
  static async getAllOrders(queryParams) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10;
    const status = queryParams.status || undefined;
    const search = queryParams.search || undefined;

    return await OrderModel.findAll({ page, limit, status, search });
  }

  /**
   * Lấy chi tiết đơn hàng theo ID
   */
  static async getOrderById(id) {
    if (!id || isNaN(id)) {
      const error = new Error("ID đơn hàng không hợp lệ");
      error.statusCode = 400;
      throw error;
    }

    const order = await OrderModel.findById(id);
    if (!order) {
      const error = new Error(`Không tìm thấy đơn hàng với ID: ${id}`);
      error.statusCode = 404;
      throw error;
    }

    return order;
  }

  /**
   * Tạo đơn hàng mới
   */
  static async createOrder(data) {
    const { customer_id, buyer_name, buyer_phone, buyer_email, shipping_address, items, payment_method } = data;

    // Validate các trường bắt buộc
    if (!buyer_name || !buyer_name.trim()) {
      const error = new Error("Tên người mua không được để trống");
      error.statusCode = 400;
      throw error;
    }

    if (!buyer_phone || !buyer_phone.trim()) {
      const error = new Error("Số điện thoại không được để trống");
      error.statusCode = 400;
      throw error;
    }

    if (!shipping_address || !shipping_address.trim()) {
      const error = new Error("Địa chỉ giao hàng không được để trống");
      error.statusCode = 400;
      throw error;
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      const error = new Error("Đơn hàng phải có ít nhất 1 sản phẩm");
      error.statusCode = 400;
      throw error;
    }

    for (const item of items) {
      if (!item.product_id) {
        const error = new Error("Mỗi sản phẩm phải có product_id");
        error.statusCode = 400;
        throw error;
      }
      if (!item.quantity || item.quantity <= 0) {
        const error = new Error("Số lượng sản phẩm phải lớn hơn 0");
        error.statusCode = 400;
        throw error;
      }
    }

    // Lấy unit_price từ bảng products và tính total_amount
    const productIds = items.map((item) => item.product_id);
    const placeholders = productIds.map((_, i) => `$${i + 1}`).join(", ");
    const productsResult = await query(
      `SELECT product_id, price, stock_quantity, is_active, product_name FROM products WHERE product_id IN (${placeholders})`,
      productIds
    );

    const productMap = {};
    for (const p of productsResult.rows) {
      productMap[p.product_id] = p;
    }

    // Kiểm tra sản phẩm tồn tại và còn active
    let totalAmount = 0;
    const enrichedItems = [];

    for (const item of items) {
      const product = productMap[item.product_id];
      if (!product) {
        const error = new Error(`Không tìm thấy sản phẩm với ID: ${item.product_id}`);
        error.statusCode = 404;
        throw error;
      }
      if (!product.is_active) {
        const error = new Error(`Sản phẩm "${product.product_name}" đã ngừng kinh doanh`);
        error.statusCode = 400;
        throw error;
      }

      const unitPrice = parseFloat(product.price);
      totalAmount += item.quantity * unitPrice;

      enrichedItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: unitPrice,
      });
    }

    // Gọi model để tạo đơn hàng
    return await OrderModel.create({
      customer_id: customer_id || null,
      buyer_name: buyer_name.trim(),
      buyer_phone: buyer_phone.trim(),
      buyer_email: buyer_email ? buyer_email.trim() : null,
      shipping_address: shipping_address.trim(),
      total_amount: totalAmount,
      items: enrichedItems,
      payment_method: payment_method || null,
    });
  }

  /**
   * Cập nhật trạng thái đơn hàng
   */
  static async updateOrderStatus(id, { status, admin_notes }) {
    if (!id || isNaN(id)) {
      const error = new Error("ID đơn hàng không hợp lệ");
      error.statusCode = 400;
      throw error;
    }

    // Validate trạng thái hợp lệ
    if (!VALID_STATUSES.has(status)) {
      const error = new Error(
        `Trạng thái không hợp lệ. Các trạng thái hợp lệ: ${STATUS_ORDER.join(", ")}`
      );
      error.statusCode = 400;
      throw error;
    }

    // Lấy đơn hàng hiện tại để kiểm tra trạng thái
    const currentOrder = await OrderModel.findById(id);
    if (!currentOrder) {
      const error = new Error(`Không tìm thấy đơn hàng với ID: ${id}`);
      error.statusCode = 404;
      throw error;
    }

    const currentStatusIndex = STATUS_ORDER.indexOf(currentOrder.status);
    const newStatusIndex = STATUS_ORDER.indexOf(status);

    // Không cho chuyển trạng thái ngược (trừ Cancelled có thể từ bất kỳ trạng thái nào trước Completed)
    if (status !== "Cancelled" && newStatusIndex <= currentStatusIndex) {
      const error = new Error(
        `Không thể chuyển trạng thái từ "${currentOrder.status}" sang "${status}"`
      );
      error.statusCode = 400;
      throw error;
    }

    // Không cho hủy đơn đã hoàn thành
    if (status === "Cancelled" && currentOrder.status === "Completed") {
      const error = new Error("Không thể hủy đơn hàng đã hoàn thành");
      error.statusCode = 400;
      throw error;
    }

    // Không cho thay đổi đơn đã hủy
    if (currentOrder.status === "Cancelled") {
      const error = new Error("Không thể thay đổi trạng thái đơn hàng đã hủy");
      error.statusCode = 400;
      throw error;
    }

    // Nếu hủy đơn thì gọi cancelOrder để hoàn lại stock
    if (status === "Cancelled") {
      return await OrderModel.cancelOrder(id);
    }

    return await OrderModel.updateStatus(id, status, admin_notes);
  }

  /**
   * Lấy danh sách đơn hàng Pending gần nhất
   */
  static async getPendingOrders() {
    return await OrderModel.getRecentPending();
  }
}

module.exports = OrderService;
