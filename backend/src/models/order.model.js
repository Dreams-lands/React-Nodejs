const { pool, query } = require("../config/db");

/**
 * OrderModel (Tầng Model trong kiến trúc MVC)
 * Tương tác trực tiếp với bảng `orders`, `order_items`, `transactions` trong PostgreSQL
 */
class OrderModel {
  /**
   * Lấy danh sách đơn hàng có phân trang, lọc theo status, tìm kiếm
   */
  static async findAll({ page = 1, limit = 10, status, search } = {}) {
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    if (status) {
      whereConditions.push(`orders.status = $${paramIndex++}`);
      params.push(status);
    }

    if (search) {
      whereConditions.push(
        `(orders.buyer_name ILIKE $${paramIndex} OR orders.order_id::TEXT LIKE $${paramIndex})`
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0 ? "WHERE " + whereConditions.join(" AND ") : "";

    // Đếm tổng số bản ghi
    const countQuery = `SELECT COUNT(*) AS total FROM orders ${whereClause}`;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit);

    // Lấy danh sách đơn hàng
    const dataQuery = `
      SELECT 
        orders.*,
        users.full_name AS customer_name,
        users.email AS customer_email
      FROM orders
      LEFT JOIN users ON orders.customer_id = users.user_id
      ${whereClause}
      ORDER BY orders.order_date DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    params.push(limit, offset);

    const dataResult = await query(dataQuery, params);

    return {
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Lấy chi tiết đơn hàng theo ID, kèm danh sách items
   */
  static async findById(id) {
    // Lấy thông tin đơn hàng
    const orderQuery = `
      SELECT 
        orders.*,
        users.full_name AS customer_name,
        users.email AS customer_email,
        users.phone AS customer_phone
      FROM orders
      LEFT JOIN users ON orders.customer_id = users.user_id
      WHERE orders.order_id = $1
    `;
    const orderResult = await query(orderQuery, [id]);

    if (orderResult.rows.length === 0) {
      return null;
    }

    const order = orderResult.rows[0];

    // Lấy danh sách items của đơn hàng
    const itemsQuery = `
      SELECT 
        oi.*,
        p.product_name,
        p.sku,
        (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.product_id AND pi.is_primary = TRUE LIMIT 1) AS image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = $1
      ORDER BY oi.order_item_id
    `;
    const itemsResult = await query(itemsQuery, [id]);

    // Lấy thông tin giao dịch
    const transactionQuery = `
      SELECT * FROM transactions WHERE order_id = $1 ORDER BY transaction_date DESC
    `;
    const transactionResult = await query(transactionQuery, [id]);

    order.items = itemsResult.rows;
    order.transactions = transactionResult.rows;

    return order;
  }

  /**
   * Tạo đơn hàng mới (sử dụng PostgreSQL Transaction)
   */
  static async create({
    customer_id,
    buyer_name,
    buyer_phone,
    buyer_email,
    shipping_address,
    total_amount,
    items,
    payment_method,
  }) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. INSERT vào bảng orders
      const orderResult = await client.query(
        `INSERT INTO orders (customer_id, buyer_name, buyer_phone, buyer_email, shipping_address, total_amount, order_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), 'Pending')
         RETURNING *`,
        [
          customer_id || null,
          buyer_name,
          buyer_phone,
          buyer_email || null,
          shipping_address,
          total_amount,
        ]
      );
      const order = orderResult.rows[0];
      const orderId = order.order_id;

      // 2. INSERT từng item vào order_items + trừ stock
      for (const item of items) {
        // Insert order_item
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
           VALUES ($1, $2, $3, $4)`,
          [orderId, item.product_id, item.quantity, item.unit_price]
        );

        // 3. Trừ stock_quantity trong products
        const stockResult = await client.query(
          `UPDATE products 
           SET stock_quantity = stock_quantity - $1 
           WHERE product_id = $2 AND stock_quantity >= $1`,
          [item.quantity, item.product_id]
        );

        if (stockResult.rowCount === 0) {
          await client.query("ROLLBACK");
          const error = new Error(
            `Sản phẩm ID ${item.product_id} không đủ số lượng trong kho`
          );
          error.statusCode = 400;
          throw error;
        }
      }

      // 4. INSERT vào bảng transactions
      if (payment_method) {
        await client.query(
          `INSERT INTO transactions (order_id, payment_method, amount, transaction_date, status)
           VALUES ($1, $2, $3, NOW(), 'Success')`,
          [orderId, payment_method, total_amount]
        );
      }

      // 5. COMMIT
      await client.query("COMMIT");

      return order;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Cập nhật trạng thái đơn hàng
   */
  static async updateStatus(id, status, admin_notes) {
    const result = await query(
      `UPDATE orders SET status = $1, admin_notes = $2 WHERE order_id = $3 RETURNING *`,
      [status, admin_notes || null, id]
    );
    return result.rows[0] || null;
  }

  /**
   * Hủy đơn hàng (sử dụng PostgreSQL Transaction - hoàn lại stock)
   */
  static async cancelOrder(id) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Kiểm tra đơn hàng tồn tại
      const orderResult = await client.query(
        `SELECT * FROM orders WHERE order_id = $1`,
        [id]
      );

      if (orderResult.rows.length === 0) {
        await client.query("ROLLBACK");
        const error = new Error(`Không tìm thấy đơn hàng với ID: ${id}`);
        error.statusCode = 404;
        throw error;
      }

      // 2. Lấy danh sách order_items
      const itemsResult = await client.query(
        `SELECT * FROM order_items WHERE order_id = $1`,
        [id]
      );

      // 3. Cộng lại stock_quantity cho từng product
      for (const item of itemsResult.rows) {
        await client.query(
          `UPDATE products SET stock_quantity = stock_quantity + $1 WHERE product_id = $2`,
          [item.quantity, item.product_id]
        );
      }

      // 4. Cập nhật status đơn hàng thành 'Cancelled'
      const updatedOrder = await client.query(
        `UPDATE orders SET status = 'Cancelled' WHERE order_id = $1 RETURNING *`,
        [id]
      );

      // 5. COMMIT
      await client.query("COMMIT");

      return updatedOrder.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Lấy 5 đơn hàng Pending gần nhất
   */
  static async getRecentPending() {
    const result = await query(
      `SELECT 
        orders.*,
        users.full_name AS customer_name
       FROM orders
       LEFT JOIN users ON orders.customer_id = users.user_id
       WHERE orders.status = 'Pending'
       ORDER BY orders.order_date DESC
       LIMIT 5`
    );
    return result.rows;
  }
}

module.exports = OrderModel;
