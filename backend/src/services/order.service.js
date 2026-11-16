const OrderModel = require("../models/order.model");
const ProductModel = require("../models/product.model");

/**
 * OrderService (Tầng Service)
 * Xử lý nghiệp vụ đặt hàng, thanh toán và tra cứu đơn hàng
 */
class OrderService {
  /**
   * Đặt đơn hàng mới (Chốt giá sản phẩm trực tiếp từ DB để đảm bảo an toàn tuyệt đối)
   */
  static async createOrder({
    customer_id = null,
    buyer_name,
    buyer_phone,
    buyer_email = null,
    shipping_address,
    payment_method = "COD",
    discount_amount = 0,
    final_amount = null,
    items = [],
    admin_notes = null,
  }) {
    if (!buyer_name || !buyer_name.trim()) {
      const error = new Error("Họ và tên người nhận hàng không được để trống");
      error.statusCode = 400;
      throw error;
    }

    if (!buyer_phone || !buyer_phone.trim()) {
      const error = new Error("Số điện thoại liên hệ không được để trống");
      error.statusCode = 400;
      throw error;
    }

    if (!shipping_address || !shipping_address.trim()) {
      const error = new Error("Địa chỉ giao hàng không được để trống");
      error.statusCode = 400;
      throw error;
    }

    if (!Array.isArray(items) || items.length === 0) {
      const error = new Error("Đơn hàng phải chứa ít nhất một sản phẩm");
      error.statusCode = 400;
      throw error;
    }

    // Xác thực và tính toán giá tiền chuẩn từ Database
    let verifiedTotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const prodId = Number(item.product_id || item.id);
      const qty = Math.max(1, Number(item.quantity) || 1);

      const product = await ProductModel.findById(prodId);
      if (!product || !product.is_active) {
        const error = new Error(`Sản phẩm với ID ${prodId} không tồn tại hoặc đã ngừng bán`);
        error.statusCode = 404;
        throw error;
      }

      const itemPrice = Number(product.price);
      verifiedTotal += itemPrice * qty;

      verifiedItems.push({
        product_id: product.product_id,
        quantity: qty,
        unit_price: itemPrice,
      });
    }

    const discountAmount = Number(discount_amount) || 0;
    const finalAmount =
      final_amount !== null && final_amount !== undefined
        ? Number(final_amount)
        : Math.max(0, verifiedTotal - discountAmount);

    // Gọi Model tạo đơn hàng với Transaction
    return await OrderModel.create({
      customer_id,
      buyer_name: buyer_name.trim(),
      buyer_phone: buyer_phone.trim(),
      buyer_email: buyer_email ? buyer_email.trim() : null,
      shipping_address: shipping_address.trim(),
      total_amount: verifiedTotal,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      payment_method,
      items: verifiedItems,
      admin_notes,
    });
  }

  /**
   * Lấy danh sách đơn hàng
   */
  static async getAllOrders(filters) {
    return await OrderModel.findAll(filters);
  }

  /**
   * Lấy chi tiết đơn hàng (Kiểm tra quyền truy cập)
   */
  static async getOrderById(orderId, currentUserId = null, currentUserRole = "Customer") {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      const error = new Error(`Không tìm thấy đơn hàng #${orderId}`);
      error.statusCode = 404;
      throw error;
    }

    // Nếu là Customer thì chỉ xem được đơn hàng của chính mình (nếu đơn có customer_id)
    if (currentUserRole === "Customer" && order.customer_id && currentUserId) {
      if (order.customer_id !== Number(currentUserId)) {
        const error = new Error("Bạn không có quyền xem đơn hàng này");
        error.statusCode = 403;
        throw error;
      }
    }

    return order;
  }

  /**
   * Tra cứu đơn hàng theo Mã đơn và Số điện thoại (Dành cho khách tra cứu trên website)
   */
  static async lookupOrder(code, phone) {
    if (!code || !phone) {
      const error = new Error("Vui lòng nhập đầy đủ mã đơn hàng và số điện thoại liên hệ");
      error.statusCode = 400;
      throw error;
    }

    const order = await OrderModel.findByCodeAndPhone(code, phone);
    if (!order) {
      const error = new Error("Không tìm thấy đơn hàng khớp với Mã đơn hàng và Số điện thoại này");
      error.statusCode = 404;
      throw error;
    }

    return order;
  }

  /**
   * Cập nhật trạng thái đơn hàng (Admin/Staff)
   */
  static async updateStatus(orderId, status, adminNotes) {
    const validStatuses = ["Pending", "Confirmed", "Shipping", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      const error = new Error(`Trạng thái không hợp lệ. Phải là một trong: ${validStatuses.join(", ")}`);
      error.statusCode = 400;
      throw error;
    }

    const updated = await OrderModel.updateStatus(orderId, status, adminNotes);
    if (!updated) {
      const error = new Error(`Không tìm thấy đơn hàng #${orderId}`);
      error.statusCode = 404;
      throw error;
    }

    return updated;
  }

  /**
   * Thống kê đơn hàng cho Admin
   */
  static async getDashboardStats() {
    return await OrderModel.getStatistics();
  }
}

module.exports = OrderService;
