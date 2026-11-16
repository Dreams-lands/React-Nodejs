const { pool } = require("../config/db");

/**
 * AuthModel (Tầng Model - Xác thực)
 * Tương tác trực tiếp với bảng `users` và `roles` trong PostgreSQL
 */
class AuthModel {
  /**
   * Tìm user theo email (kèm role_name) - dùng cho login
   * Trả về cả password_hash để so sánh
   */
  static async findByEmail(email) {
    const { rows } = await pool.query(
      `SELECT u.user_id, u.role_id, u.full_name, u.email, u.password_hash,
              u.phone, u.address, u.avatar_url, u.is_active, u.created_at,
              r.role_name
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE u.email = $1`,
      [email]
    );
    return rows[0] || null;
  }

  /**
   * Tìm user theo ID (không trả password_hash) - dùng cho getProfile
   */
  static async findById(id) {
    const { rows } = await pool.query(
      `SELECT u.user_id, u.role_id, u.full_name, u.email,
              u.phone, u.address, u.avatar_url, u.is_active, u.created_at,
              r.role_name
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE u.user_id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Tạo user mới (register)
   */
  static async createUser({ role_id, full_name, email, password_hash, phone, address }) {
    const { rows } = await pool.query(
      `INSERT INTO users (role_id, full_name, email, password_hash, phone, address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [role_id, full_name, email, password_hash, phone, address]
    );
    return rows[0];
  }

  /**
   * Cập nhật reset password token
   */
  static async updateResetToken(email, token, expires) {
    const { rows } = await pool.query(
      `UPDATE users
       SET reset_password_token = $1, reset_password_expires = $2
       WHERE email = $3
       RETURNING user_id, email`,
      [token, expires, email]
    );
    return rows[0] || null;
  }
}

module.exports = AuthModel;
