const { pool } = require("../config/db");

/**
 * ProductModel (Tầng Model)
 * Quản lý sản phẩm và ảnh sản phẩm trong PostgreSQL
 */
class ProductModel {
  /**
   * Lấy danh sách sản phẩm với bộ lọc phong phú (kèm danh mục và ảnh bìa)
   */
  static async findAll({
    category_id,
    search,
    min_price,
    max_price,
    is_active = true,
    sort = "newest",
    limit = 50,
    offset = 0,
  } = {}) {
    let query = `
      SELECT 
        p.product_id,
        p.category_id,
        c.category_name,
        p.sku,
        p.product_name,
        p.description,
        p.price,
        p.stock_quantity,
        p.is_active,
        p.created_at,
        COALESCE(
          (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = TRUE LIMIT 1),
          (SELECT image_url FROM product_images WHERE product_id = p.product_id LIMIT 1),
          ''
        ) AS primary_image,
        COALESCE(
          (SELECT json_agg(json_build_object('image_id', image_id, 'image_url', image_url, 'is_primary', is_primary))
           FROM product_images WHERE product_id = p.product_id),
          '[]'::json
        ) AS images
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      WHERE 1=1
    `;
    const params = [];

    if (is_active !== undefined && is_active !== null) {
      params.push(is_active);
      query += ` AND p.is_active = $${params.length}`;
    }

    if (category_id) {
      params.push(category_id);
      query += ` AND p.category_id = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (p.product_name ILIKE $${params.length} OR p.description ILIKE $${params.length} OR p.sku ILIKE $${params.length})`;
    }

    if (min_price !== undefined && min_price !== null) {
      params.push(min_price);
      query += ` AND p.price >= $${params.length}`;
    }

    if (max_price !== undefined && max_price !== null) {
      params.push(max_price);
      query += ` AND p.price <= $${params.length}`;
    }

    // Xử lý sắp xếp
    switch (sort) {
      case "price-asc":
        query += ` ORDER BY p.price ASC`;
        break;
      case "price-desc":
        query += ` ORDER BY p.price DESC`;
        break;
      case "name":
        query += ` ORDER BY p.product_name ASC`;
        break;
      case "newest":
      default:
        query += ` ORDER BY p.product_id DESC`;
        break;
    }

    params.push(limit);
    query += ` LIMIT $${params.length}`;

    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const { rows } = await pool.query(query, params);
    return rows;
  }

  /**
   * Lấy chi tiết một sản phẩm theo ID kèm toàn bộ gallery ảnh
   */
  static async findById(productId) {
    const query = `
      SELECT 
        p.product_id,
        p.category_id,
        c.category_name,
        p.sku,
        p.product_name,
        p.description,
        p.price,
        p.stock_quantity,
        p.is_active,
        p.created_at,
        COALESCE(
          (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = TRUE LIMIT 1),
          (SELECT image_url FROM product_images WHERE product_id = p.product_id LIMIT 1),
          ''
        ) AS primary_image,
        COALESCE(
          (SELECT json_agg(json_build_object('image_id', image_id, 'image_url', image_url, 'is_primary', is_primary) ORDER BY is_primary DESC, image_id ASC)
           FROM product_images WHERE product_id = p.product_id),
          '[]'::json
        ) AS images
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      WHERE p.product_id = $1
    `;
    const { rows } = await pool.query(query, [productId]);
    return rows[0] || null;
  }

  /**
   * Tìm sản phẩm theo SKU
   */
  static async findBySku(sku) {
    const query = `
      SELECT product_id, sku, product_name FROM products WHERE LOWER(sku) = LOWER($1)
    `;
    const { rows } = await pool.query(query, [sku.trim()]);
    return rows[0] || null;
  }

  /**
   * Thêm sản phẩm mới (kèm danh sách URL ảnh nếu có)
   */
  static async create({
    category_id,
    sku,
    product_name,
    description = null,
    price,
    stock_quantity = 0,
    images = [],
  }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const insertProdQuery = `
        INSERT INTO products (category_id, sku, product_name, description, price, stock_quantity, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, TRUE)
        RETURNING product_id, category_id, sku, product_name, description, price, stock_quantity, is_active, created_at
      `;
      const prodRes = await client.query(insertProdQuery, [
        category_id,
        sku || `SP${Date.now().toString().slice(-6)}`,
        product_name,
        description,
        price,
        stock_quantity,
      ]);
      const newProduct = prodRes.rows[0];

      // Thêm ảnh nếu có
      if (Array.isArray(images) && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          const imgUrl = typeof img === "string" ? img : img.image_url;
          const isPrimary = typeof img === "object" && img.is_primary ? true : i === 0;

          await client.query(
            `INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3)`,
            [newProduct.product_id, imgUrl, isPrimary]
          );
        }
      }

      await client.query("COMMIT");
      return await this.findById(newProduct.product_id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Cập nhật thông tin sản phẩm
   */
  static async update(productId, {
    category_id,
    sku,
    product_name,
    description,
    price,
    stock_quantity,
    is_active,
  }) {
    const query = `
      UPDATE products
      SET 
        category_id = COALESCE($1, category_id),
        sku = COALESCE($2, sku),
        product_name = COALESCE($3, product_name),
        description = COALESCE($4, description),
        price = COALESCE($5, price),
        stock_quantity = COALESCE($6, stock_quantity),
        is_active = COALESCE($7, is_active)
      WHERE product_id = $8
      RETURNING product_id, category_id, sku, product_name, description, price, stock_quantity, is_active
    `;
    const { rows } = await pool.query(query, [
      category_id || null,
      sku || null,
      product_name || null,
      description !== undefined ? description : null,
      price !== undefined ? price : null,
      stock_quantity !== undefined ? stock_quantity : null,
      is_active !== undefined ? is_active : null,
      productId,
    ]);

    if (!rows[0]) return null;
    return await this.findById(productId);
  }

  /**
   * Cập nhật số lượng tồn kho (trừ khi đặt hàng, cộng lại khi hủy)
   */
  static async updateStock(productId, delta, client = null) {
    const query = `
      UPDATE products
      SET stock_quantity = stock_quantity + $1
      WHERE product_id = $2 AND (stock_quantity + $1) >= 0
      RETURNING product_id, stock_quantity
    `;
    const executor = client || pool;
    const { rows } = await executor.query(query, [delta, productId]);
    return rows[0] || null;
  }

  /**
   * Xóa mềm sản phẩm (ẩn khỏi cửa hàng)
   */
  static async delete(productId) {
    const query = `
      UPDATE products
      SET is_active = FALSE
      WHERE product_id = $1
    `;
    const result = await pool.query(query, [productId]);
    return result.rowCount > 0;
  }

  /**
   * Thêm ảnh vào gallery của sản phẩm
   */
  static async addImage(productId, imageUrl, isPrimary = false) {
    if (isPrimary) {
      await pool.query(
        `UPDATE product_images SET is_primary = FALSE WHERE product_id = $1`,
        [productId]
      );
    }
    const query = `
      INSERT INTO product_images (product_id, image_url, is_primary)
      VALUES ($1, $2, $3)
      RETURNING image_id, product_id, image_url, is_primary
    `;
    const { rows } = await pool.query(query, [productId, imageUrl, isPrimary]);
    return rows[0];
  }

  /**
   * Xóa ảnh sản phẩm
   */
  static async deleteImage(imageId) {
    const result = await pool.query(`DELETE FROM product_images WHERE image_id = $1`, [imageId]);
    return result.rowCount > 0;
  }
}

module.exports = ProductModel;
