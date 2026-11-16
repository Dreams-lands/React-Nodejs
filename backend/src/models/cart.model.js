const { pool } = require("../config/db");

/**
 * CartModel (Tầng Model)
 * Quản lý giỏ hàng của thành viên đã đăng nhập (`carts` và `cart_items`)
 */
class CartModel {
  /**
   * Lấy hoặc tạo mới giỏ hàng cho user
   */
  static async getOrCreateCart(userId) {
    let { rows } = await pool.query(
      `SELECT cart_id, user_id FROM carts WHERE user_id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      const insertRes = await pool.query(
        `INSERT INTO carts (user_id) VALUES ($1) RETURNING cart_id, user_id`,
        [userId]
      );
      rows = insertRes.rows;
    }

    return rows[0];
  }

  /**
   * Lấy toàn bộ danh sách sản phẩm trong giỏ hàng kèm thông tin sản phẩm và ảnh
   */
  static async getCartItems(userId) {
    const cart = await this.getOrCreateCart(userId);

    const query = `
      SELECT 
        ci.cart_item_id,
        ci.cart_id,
        ci.product_id,
        ci.quantity,
        p.product_name,
        p.sku,
        p.price,
        p.stock_quantity,
        p.is_active,
        c.category_name,
        COALESCE(
          (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = TRUE LIMIT 1),
          (SELECT image_url FROM product_images WHERE product_id = p.product_id LIMIT 1),
          ''
        ) AS image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.product_id
      JOIN categories c ON p.category_id = c.category_id
      WHERE ci.cart_id = $1
      ORDER BY ci.cart_item_id DESC
    `;
    const { rows } = await pool.query(query, [cart.cart_id]);
    return {
      cart_id: cart.cart_id,
      items: rows,
      total_items: rows.reduce((acc, item) => acc + item.quantity, 0),
      total_amount: rows.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0),
    };
  }

  /**
   * Thêm sản phẩm vào giỏ hàng (nếu đã có thì cộng dồn số lượng)
   */
  static async addItem(userId, productId, quantity = 1) {
    const cart = await this.getOrCreateCart(userId);

    const query = `
      INSERT INTO cart_items (cart_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (cart_id, product_id)
      DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
      RETURNING cart_item_id, cart_id, product_id, quantity
    `;
    const { rows } = await pool.query(query, [cart.cart_id, productId, quantity]);
    return rows[0];
  }

  /**
   * Cập nhật số lượng của một mục trong giỏ hàng
   */
  static async updateQuantity(cartItemId, quantity) {
    const query = `
      UPDATE cart_items
      SET quantity = $1
      WHERE cart_item_id = $2
      RETURNING cart_item_id, cart_id, product_id, quantity
    `;
    const { rows } = await pool.query(query, [quantity, cartItemId]);
    return rows[0] || null;
  }

  /**
   * Xóa một sản phẩm khỏi giỏ hàng
   */
  static async removeItem(cartItemId) {
    const result = await pool.query(
      `DELETE FROM cart_items WHERE cart_item_id = $1`,
      [cartItemId]
    );
    return result.rowCount > 0;
  }

  /**
   * Làm trống giỏ hàng (sau khi đặt hàng thành công)
   */
  static async clearCart(userId) {
    const cart = await this.getOrCreateCart(userId);
    const result = await pool.query(
      `DELETE FROM cart_items WHERE cart_id = $1`,
      [cart.cart_id]
    );
    return result.rowCount >= 0;
  }
}

module.exports = CartModel;
