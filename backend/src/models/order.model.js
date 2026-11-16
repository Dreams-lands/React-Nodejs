const { pool } = require("../config/db");

/**
 * OrderModel (Tầng Model)
 * Quản lý đơn hàng, chi tiết đơn hàng và giao dịch thanh toán trong PostgreSQL
 */
class OrderModel {
  /**
   * Tạo đơn hàng mới hoàn chỉnh với Transaction an toàn
   * Áp dụng cho cả Khách Đăng Nhập và Khách Vãng Lai (Guest Checkout)
   */
  static async create({
    customer_id = null,
    buyer_name,
    buyer_phone,
    buyer_email = null,
    shipping_address,
    total_amount,
    discount_amount = 0,
    final_amount = null,
    payment_method = "COD",
    items = [],
    admin_notes = null,
  }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const discountAmount = Number(discount_amount) || 0;
      const finalAmount =
        final_amount !== null && final_amount !== undefined
          ? Number(final_amount)
          : Math.max(0, Number(total_amount) - discountAmount);

      // 1. Tạo đơn hàng trong bảng `orders` (bao gồm discount_amount và final_amount)
      const orderInsertQuery = `
        INSERT INTO orders (
          customer_id, 
          buyer_name, 
          buyer_phone, 
          buyer_email, 
          shipping_address, 
          total_amount, 
          discount_amount,
          final_amount,
          status, 
          admin_notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Pending', $9)
        RETURNING order_id, customer_id, buyer_name, buyer_phone, buyer_email, shipping_address, total_amount, discount_amount, final_amount, status, order_date, admin_notes
      `;
      const orderRes = await client.query(orderInsertQuery, [
        customer_id || null,
        buyer_name,
        buyer_phone,
        buyer_email,
        shipping_address,
        total_amount,
        discountAmount,
        finalAmount,
        admin_notes,
      ]);
      const createdOrder = orderRes.rows[0];

      // 2. Thêm từng mục hàng vào `order_items` và trừ tồn kho `products` kèm ghi log kho `inventory_logs`
      for (const item of items) {
        const prodId = Number(item.product_id || item.id);
        const qty = Number(item.quantity) || 1;
        const unitPrice = Number(item.unit_price || item.price);

        // Lưu vào order_items
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
           VALUES ($1, $2, $3, $4)`,
          [createdOrder.order_id, prodId, qty, unitPrice]
        );

        // Trừ tồn kho sản phẩm (nếu còn hàng)
        await client.query(
          `UPDATE products 
           SET stock_quantity = GREATEST(0, stock_quantity - $1) 
           WHERE product_id = $2`,
          [qty, prodId]
        );

        // Ghi nhật ký biến động kho hàng vào bảng `inventory_logs`
        await client.query(
          `INSERT INTO inventory_logs (product_id, user_id, change_quantity, reason)
           VALUES ($1, $2, $3, $4)`,
          [prodId, customer_id || null, -qty, `Xuất kho tự động cho Đơn hàng #${createdOrder.order_id}`]
        );
      }

      // 3. Ghi nhận giao dịch thanh toán vào bảng `transactions`
      const txStatus = payment_method.toUpperCase() === "COD" ? "Pending" : "Success";
      await client.query(
        `INSERT INTO transactions (order_id, payment_method, amount, status)
         VALUES ($1, $2, $3, $4)`,
        [createdOrder.order_id, payment_method, finalAmount, txStatus]
      );

      // 4. Nếu là khách đăng nhập, tự động làm sạch giỏ hàng
      if (customer_id) {
        await client.query(
          `DELETE FROM cart_items 
           WHERE cart_id IN (SELECT cart_id FROM carts WHERE user_id = $1)`,
          [customer_id]
        );
      }

      await client.query("COMMIT");

      // Lấy lại chi tiết đơn hàng hoàn chỉnh
      return await this.findById(createdOrder.order_id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Lấy chi tiết đơn hàng theo ID (kèm danh sách sản phẩm và giao dịch)
   */
  static async findById(orderId) {
    const orderQuery = `
      SELECT 
        o.order_id,
        o.customer_id,
        u.full_name AS customer_registered_name,
        o.buyer_name,
        o.buyer_phone,
        o.buyer_email,
        o.shipping_address,
        o.total_amount,
        o.discount_amount,
        o.final_amount,
        o.order_date,
        o.status,
        o.admin_notes
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.user_id
      WHERE o.order_id = $1
    `;
    const { rows } = await pool.query(orderQuery, [orderId]);
    if (!rows[0]) return null;

    const order = rows[0];

    // Lấy items
    const itemsQuery = `
      SELECT 
        oi.order_item_id,
        oi.order_id,
        oi.product_id,
        p.product_name,
        p.sku,
        oi.quantity,
        oi.unit_price,
        (oi.quantity * oi.unit_price) AS subtotal,
        COALESCE(
          (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = TRUE LIMIT 1),
          (SELECT image_url FROM product_images WHERE product_id = p.product_id LIMIT 1),
          ''
        ) AS image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = $1
      ORDER BY oi.order_item_id ASC
    `;
    const itemsRes = await pool.query(itemsQuery, [orderId]);
    order.items = itemsRes.rows;

    // Lấy giao dịch
    const txQuery = `
      SELECT transaction_id, order_id, payment_method, amount, transaction_date, status
      FROM transactions
      WHERE order_id = $1
      ORDER BY transaction_id DESC
    `;
    const txRes = await pool.query(txQuery, [orderId]);
    order.transactions = txRes.rows;
    order.payment_method = txRes.rows[0]?.payment_method || "COD";

    return order;
  }

  /**
   * Tra cứu đơn hàng theo Mã đơn và Số điện thoại (phục vụ chức năng Lookup của Frontend)
   */
  static async findByCodeAndPhone(code, phone) {
    // Làm sạch số điện thoại và mã đơn
    const cleanPhone = phone.replace(/\D/g, "");
    const cleanCode = code.toString().trim().replace(/^#/, "").replace(/^PH/i, "");

    const query = `
      SELECT 
        o.order_id,
        o.customer_id,
        o.buyer_name,
        o.buyer_phone,
        o.buyer_email,
        o.shipping_address,
        o.total_amount,
        o.order_date,
        o.status,
        o.admin_notes
      FROM orders o
      WHERE (o.order_id::text = $1 OR o.order_id::text = $2)
        AND REGEXP_REPLACE(o.buyer_phone, '\\D', '', 'g') = $3
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [code.trim(), cleanCode, cleanPhone]);
    if (!rows[0]) return null;

    return await this.findById(rows[0].order_id);
  }

  /**
   * Lấy danh sách đơn hàng với phân trang và lọc
   */
  static async findAll({ customer_id, status, search, limit = 50, offset = 0 } = {}) {
    let query = `
      SELECT 
        o.order_id,
        o.customer_id,
        o.buyer_name,
        o.buyer_phone,
        o.buyer_email,
        o.shipping_address,
        o.total_amount,
        o.discount_amount,
        o.final_amount,
        o.order_date,
        o.status,
        o.admin_notes,
        COALESCE(
          (SELECT t.payment_method FROM transactions t WHERE t.order_id = o.order_id ORDER BY t.transaction_id DESC LIMIT 1),
          'COD'
        ) AS payment_method,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.order_id) AS total_items
      FROM orders o
      WHERE 1=1
    `;
    const params = [];

    if (customer_id) {
      params.push(customer_id);
      query += ` AND o.customer_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND LOWER(o.status) = LOWER($${params.length})`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (o.buyer_name ILIKE $${params.length} OR o.buyer_phone ILIKE $${params.length} OR o.order_id::text ILIKE $${params.length})`;
    }

    query += ` ORDER BY o.order_id DESC`;

    params.push(limit);
    query += ` LIMIT $${params.length}`;

    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const { rows } = await pool.query(query, params);

    // Lấy items tóm tắt cho mỗi order
    for (const order of rows) {
      const itemsRes = await pool.query(
        `SELECT 
          oi.order_item_id, oi.product_id, p.product_name, oi.quantity, oi.unit_price,
          COALESCE(
            (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = TRUE LIMIT 1),
            ''
          ) AS image
         FROM order_items oi
         JOIN products p ON oi.product_id = p.product_id
         WHERE oi.order_id = $1`,
        [order.order_id]
      );
      order.items = itemsRes.rows;
    }

    return rows;
  }

  /**
   * Cập nhật trạng thái đơn hàng (Pending -> Confirmed -> Shipping -> Completed / Cancelled)
   */
  static async updateStatus(orderId, status, adminNotes = null) {
    const query = `
      UPDATE orders
      SET 
        status = $1,
        admin_notes = COALESCE($2, admin_notes)
      WHERE order_id = $3
      RETURNING order_id, status, admin_notes
    `;
    const { rows } = await pool.query(query, [status, adminNotes, orderId]);
    if (!rows[0]) return null;

    return await this.findById(orderId);
  }

  /**
   * Lấy thống kê tổng quan (phục vụ dashboard admin)
   */
  static async getStatistics() {
    const query = `
      SELECT 
        COUNT(order_id) AS total_orders,
        COUNT(order_id) FILTER (WHERE status = 'Pending') AS pending_orders,
        COUNT(order_id) FILTER (WHERE status = 'Completed') AS completed_orders,
        COALESCE(SUM(total_amount) FILTER (WHERE status = 'Completed'), 0) AS total_revenue
      FROM orders
    `;
    const { rows } = await pool.query(query);
    return rows[0];
  }
}

module.exports = OrderModel;
