const { pool } = require("../config/db");

/**
 * ProductModel - Tương tác với bảng `products` trong PostgreSQL
 */
class ProductModel {
  /**
   * Lấy danh sách sản phẩm có phân trang, tìm kiếm, lọc
   */
  static async findAll({ page = 1, limit = 10, search, category_id, status }) {
    const conditions = ["p.is_active = TRUE"];
    const values = [];
    let paramIndex = 1;

    // Tìm kiếm theo tên hoặc SKU
    if (search) {
      conditions.push(
        `(p.product_name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`
      );
      values.push(`%${search}%`);
      paramIndex++;
    }

    // Lọc theo danh mục
    if (category_id) {
      conditions.push(`p.category_id = $${paramIndex}`);
      values.push(category_id);
      paramIndex++;
    }

    // Lọc theo trạng thái tồn kho
    if (status === "in_stock") {
      conditions.push("p.stock_quantity > 0");
    } else if (status === "low_stock") {
      conditions.push("p.stock_quantity <= 15 AND p.stock_quantity > 0");
    } else if (status === "out_of_stock") {
      conditions.push("p.stock_quantity = 0");
    }

    const whereClause = conditions.join(" AND ");

    // Đếm tổng số bản ghi
    const countQuery = `SELECT COUNT(*) FROM products p WHERE ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count, 10);

    // Phân trang
    const offset = (page - 1) * limit;
    values.push(limit);
    const limitParam = paramIndex++;
    values.push(offset);
    const offsetParam = paramIndex++;

    const dataQuery = `
      SELECT p.*, c.category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE ${whereClause}
      ORDER BY p.product_id DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;
    const { rows } = await pool.query(dataQuery, values);

    return {
      data: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Tìm sản phẩm theo ID (kèm thông tin danh mục)
   */
  static async findById(id) {
    const { rows } = await pool.query(
      `SELECT p.*, c.category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.category_id
       WHERE p.product_id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Tạo sản phẩm mới
   */
  static async create({ category_id, sku, product_name, description, price, stock_quantity }) {
    const { rows } = await pool.query(
      `INSERT INTO products (category_id, sku, product_name, description, price, stock_quantity)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [category_id, sku, product_name, description || null, price, stock_quantity || 0]
    );
    return rows[0];
  }

  /**
   * Cập nhật sản phẩm - chỉ update những field được truyền
   */
  static async update(id, data) {
    const allowedFields = [
      "category_id",
      "sku",
      "product_name",
      "description",
      "price",
      "stock_quantity",
    ];
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${paramIndex++}`);
        values.push(data[field]);
      }
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE products SET ${fields.join(", ")} WHERE product_id = $${paramIndex} RETURNING *`,
      values
    );
    return rows[0] || null;
  }

  /**
   * Xóa mềm sản phẩm
   */
  static async softDelete(id) {
    const { rows } = await pool.query(
      "UPDATE products SET is_active = FALSE WHERE product_id = $1 RETURNING *",
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Lấy sản phẩm tồn kho thấp
   */
  static async findLowStock(threshold = 15) {
    const { rows } = await pool.query(
      `SELECT p.*, c.category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.category_id
       WHERE p.stock_quantity <= $1 AND p.is_active = TRUE
       ORDER BY p.stock_quantity ASC`,
      [threshold]
    );
    return rows;
  }

  /**
   * Cập nhật số lượng tồn kho
   */
  static async updateStock(id, quantity) {
    const { rows } = await pool.query(
      "UPDATE products SET stock_quantity = $1 WHERE product_id = $2 RETURNING *",
      [quantity, id]
    );
    return rows[0] || null;
  }
}

module.exports = ProductModel;
