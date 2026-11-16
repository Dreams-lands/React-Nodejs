const { pool } = require("../config/db");

/**
 * CategoryModel (Tầng Model)
 * Quản lý danh mục sản phẩm trong PostgreSQL
 */
class CategoryModel {
  /**
   * Lấy danh sách danh mục (kèm số lượng sản phẩm đang có)
   */
  static async findAll({ is_active = true } = {}) {
    let query = `
      SELECT 
        c.category_id,
        c.category_name,
        c.description,
        c.is_active,
        COUNT(p.product_id) FILTER (WHERE p.is_active = TRUE) AS product_count
      FROM categories c
      LEFT JOIN products p ON c.category_id = p.category_id
      WHERE 1=1
    `;
    const params = [];

    if (is_active !== undefined && is_active !== null) {
      params.push(is_active);
      query += ` AND c.is_active = $${params.length}`;
    }

    query += `
      GROUP BY c.category_id
      ORDER BY c.category_id ASC
    `;

    const { rows } = await pool.query(query, params);
    return rows;
  }

  /**
   * Tìm danh mục theo ID
   */
  static async findById(categoryId) {
    const query = `
      SELECT 
        category_id,
        category_name,
        description,
        is_active
      FROM categories
      WHERE category_id = $1
    `;
    const { rows } = await pool.query(query, [categoryId]);
    return rows[0] || null;
  }

  /**
   * Thêm danh mục mới
   */
  static async create({ category_name, description = null, is_active = true }) {
    const query = `
      INSERT INTO categories (category_name, description, is_active)
      VALUES ($1, $2, $3)
      RETURNING category_id, category_name, description, is_active
    `;
    const { rows } = await pool.query(query, [category_name, description, is_active]);
    return rows[0];
  }

  /**
   * Cập nhật danh mục
   */
  static async update(categoryId, { category_name, description, is_active }) {
    const query = `
      UPDATE categories
      SET 
        category_name = COALESCE($1, category_name),
        description = COALESCE($2, description),
        is_active = COALESCE($3, is_active)
      WHERE category_id = $4
      RETURNING category_id, category_name, description, is_active
    `;
    const { rows } = await pool.query(query, [
      category_name || null,
      description !== undefined ? description : null,
      is_active !== undefined ? is_active : null,
      categoryId,
    ]);
    return rows[0] || null;
  }

  /**
   * Khóa / Xóa mềm danh mục
   */
  static async delete(categoryId) {
    const query = `
      UPDATE categories
      SET is_active = FALSE
      WHERE category_id = $1
    `;
    const result = await pool.query(query, [categoryId]);
    return result.rowCount > 0;
  }
}

module.exports = CategoryModel;
