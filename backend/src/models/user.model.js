const { pool } = require("../config/db");

/**
 * UserModel (Tầng Model trong kiến trúc MVC)
 * Tương tác trực tiếp với bảng `users` và `roles` trong PostgreSQL
 */
class UserModel {
  /**
   * Lấy danh sách người dùng kèm tên quyền
   */
  static async findAll({ role_id, search, is_active } = {}) {
    let query = `
      SELECT 
        u.user_id,
        u.role_id,
        r.role_name,
        u.full_name,
        u.email,
        u.phone,
        u.address,
        u.avatar_url,
        u.is_active,
        u.created_at
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE 1=1
    `;
    const params = [];

    if (role_id) {
      params.push(role_id);
      query += ` AND u.role_id = $${params.length}`;
    }

    if (is_active !== undefined) {
      params.push(is_active);
      query += ` AND u.is_active = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR u.phone ILIKE $${params.length})`;
    }

    query += ` ORDER BY u.user_id DESC`;

    const { rows } = await pool.query(query, params);
    return rows;
  }

  /**
   * Tìm người dùng theo ID
   */
  static async findById(userId) {
    const query = `
      SELECT 
        u.user_id,
        u.role_id,
        r.role_name,
        u.full_name,
        u.email,
        u.phone,
        u.address,
        u.avatar_url,
        u.is_active,
        u.created_at
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE u.user_id = $1
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows[0] || null;
  }

  /**
   * Tìm người dùng theo Email (bao gồm password_hash để xác thực đăng nhập)
   */
  static async findByEmail(email) {
    const query = `
      SELECT 
        u.user_id,
        u.role_id,
        r.role_name,
        u.full_name,
        u.email,
        u.password_hash,
        u.phone,
        u.address,
        u.avatar_url,
        u.is_active,
        u.created_at
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE LOWER(u.email) = LOWER($1)
    `;
    const { rows } = await pool.query(query, [email.trim()]);
    return rows[0] || null;
  }

  /**
   * Tìm người dùng theo Email hoặc Số điện thoại (dành cho đăng nhập linh hoạt)
   */
  static async findByEmailOrPhone(identifier) {
    const query = `
      SELECT 
        u.user_id,
        u.role_id,
        r.role_name,
        u.full_name,
        u.email,
        u.password_hash,
        u.phone,
        u.address,
        u.avatar_url,
        u.is_active,
        u.created_at
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE LOWER(u.email) = LOWER($1) OR u.phone = $1
    `;
    const { rows } = await pool.query(query, [identifier.trim()]);
    return rows[0] || null;
  }

  /**
   * Lấy ID của quyền theo tên (Ví dụ: 'Customer', 'Admin', 'Manager', 'Staff')
   */
  static async getRoleIdByName(roleName) {
    const { rows } = await pool.query(
      `SELECT role_id FROM roles WHERE LOWER(role_name) = LOWER($1) LIMIT 1`,
      [roleName.trim()]
    );
    return rows[0]?.role_id || 4;
  }

  /**
   * Tạo tài khoản người dùng mới
   */
  static async create({
    role_id,
    full_name,
    email,
    password_hash,
    phone = null,
    address = null,
    avatar_url = null,
  }) {
    // Tự động gán quyền Customer nếu không truyền role_id
    const resolvedRoleId = role_id || (await this.getRoleIdByName("Customer"));

    const query = `
      INSERT INTO users (role_id, full_name, email, password_hash, phone, address, avatar_url, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
      RETURNING user_id, role_id, full_name, email, phone, address, avatar_url, is_active, created_at
    `;
    const { rows } = await pool.query(query, [
      resolvedRoleId,
      full_name,
      email.toLowerCase().trim(),
      password_hash,
      phone,
      address,
      avatar_url,
    ]);
    return rows[0];
  }

  /**
   * Cập nhật thông tin tài khoản người dùng
   */
  static async update(userId, { full_name, phone, address, avatar_url, role_id, is_active }) {
    const query = `
      UPDATE users
      SET 
        full_name = COALESCE($1, full_name),
        phone = COALESCE($2, phone),
        address = COALESCE($3, address),
        avatar_url = COALESCE($4, avatar_url),
        role_id = COALESCE($5, role_id),
        is_active = COALESCE($6, is_active)
      WHERE user_id = $7
      RETURNING user_id, role_id, full_name, email, phone, address, avatar_url, is_active, created_at
    `;
    const { rows } = await pool.query(query, [
      full_name || null,
      phone !== undefined ? phone : null,
      address !== undefined ? address : null,
      avatar_url !== undefined ? avatar_url : null,
      role_id || null,
      is_active !== undefined ? is_active : null,
      userId,
    ]);
    return rows[0] || null;
  }

  /**
   * Đổi mật khẩu
   */
  static async updatePassword(userId, passwordHash) {
    const query = `
      UPDATE users
      SET password_hash = $1
      WHERE user_id = $2
    `;
    const result = await pool.query(query, [passwordHash, userId]);
    return result.rowCount > 0;
  }

  /**
   * Khóa / Vô hiệu hóa tài khoản (Soft Delete)
   */
  static async delete(userId) {
    const query = `
      UPDATE users
      SET is_active = FALSE
      WHERE user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rowCount > 0;
  }

  /**
   * Lấy danh sách các quyền trong hệ thống
   */
  static async getRoles() {
    const { rows } = await pool.query("SELECT role_id, role_name FROM roles ORDER BY role_id ASC");
    return rows;
  }
}

module.exports = UserModel;
