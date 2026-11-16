const { pool } = require("../config/db");

/**
 * CategoryModel - Tương tác với bảng `categories` trong PostgreSQL
 */
class CategoryModel {
  /**
   * Lấy tất cả danh mục đang hoạt động
   */
  static async findAll() {
    const { rows } = await pool.query(
      "SELECT * FROM categories WHERE is_active = TRUE ORDER BY category_id"
    );
    return rows;
  }

  /**
   * Tìm danh mục theo ID
   */
  static async findById(id) {
    const { rows } = await pool.query(
      "SELECT * FROM categories WHERE category_id = $1",
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Tạo danh mục mới
   */
  static async create({ category_name, description }) {
    const { rows } = await pool.query(
      `INSERT INTO categories (category_name, description)
       VALUES ($1, $2)
       RETURNING *`,
      [category_name, description || null]
    );
    return rows[0];
  }

  /**
   * Cập nhật danh mục - chỉ update những field được truyền vào
   */
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (data.category_name !== undefined) {
      fields.push(`category_name = $${paramIndex++}`);
      values.push(data.category_name);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE categories SET ${fields.join(", ")} WHERE category_id = $${paramIndex} RETURNING *`,
      values
    );
    return rows[0] || null;
  }

  /**
   * Xóa mềm danh mục (đặt is_active = FALSE)
   */
  static async softDelete(id) {
    const { rows } = await pool.query(
      "UPDATE categories SET is_active = FALSE WHERE category_id = $1 RETURNING *",
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Đếm số sản phẩm đang hoạt động trong danh mục
   */
  static async countProducts(categoryId) {
    const { rows } = await pool.query(
      "SELECT COUNT(*) FROM products WHERE category_id = $1 AND is_active = TRUE",
      [categoryId]
    );
    return parseInt(rows[0].count, 10);
  }
}

module.exports = CategoryModel;
