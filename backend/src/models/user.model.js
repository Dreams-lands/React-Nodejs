const { pool } = require("../config/db");

/**
 * UserModel (Tầng Model trong kiến trúc MVC)
 * Tương tác trực tiếp với bảng `users` trong Cơ sở dữ liệu PostgreSQL PetHub
 */
let inMemoryUsers = [
  { id: 1, name: "Trịnh Anh Khoa", email: "admin@pethub.com", role: "Admin", status: "active", createdAt: new Date() },
  { id: 2, name: "Linh Phạm", email: "linh.staff@pethub.com", role: "Staff", status: "active", createdAt: new Date() },
  { id: 3, name: "Khách Đăng Nhập", email: "khach@gmail.com", role: "Customer", status: "active", createdAt: new Date() },
];

class UserModel {
  /**
   * Khởi tạo kiểm tra bảng users (an toàn)
   */
  static async initTable() {
    try {
      // Chỉ kiểm tra kết nối bảng users
      await pool.query("SELECT 1 FROM users LIMIT 1");
    } catch (error) {
      console.warn("ℹ️  [Model] Bảng users chưa sẵn sàng hoặc đang dùng schema PetHub:", error.message);
    }
  }

  /**
   * Lấy danh sách tất cả người dùng (tương thích PetHub)
   */
  static async findAll() {
    try {
      const { rows } = await pool.query(`
        SELECT 
          u.user_id AS id,
          u.full_name AS name,
          u.email,
          COALESCE(r.role_name, 'Customer') AS role,
          CASE WHEN u.is_active THEN 'active' ELSE 'inactive' END AS status,
          u.phone,
          u.address,
          u.created_at AS "createdAt"
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
        ORDER BY u.user_id DESC
      `);
      return rows;
    } catch (error) {
      console.warn("⚠️  [Model] Lấy danh sách user lỗi, dùng in-memory:", error.message);
      return inMemoryUsers;
    }
  }

  /**
   * Lấy thông tin người dùng theo ID
   */
  static async findById(id) {
    try {
      const { rows } = await pool.query(
        `SELECT 
          u.user_id AS id,
          u.full_name AS name,
          u.email,
          COALESCE(r.role_name, 'Customer') AS role,
          CASE WHEN u.is_active THEN 'active' ELSE 'inactive' END AS status,
          u.phone,
          u.address,
          u.created_at AS "createdAt"
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = $1`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      return inMemoryUsers.find((u) => u.id === Number(id)) || null;
    }
  }

  /**
   * Tìm người dùng theo Email
   */
  static async findByEmail(email) {
    try {
      const { rows } = await pool.query(
        `SELECT 
          u.user_id AS id,
          u.full_name AS name,
          u.email,
          COALESCE(r.role_name, 'Customer') AS role,
          u.password_hash,
          CASE WHEN u.is_active THEN 'active' ELSE 'inactive' END AS status
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = $1`,
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      return inMemoryUsers.find((u) => u.email === email) || null;
    }
  }

  /**
   * Tạo người dùng mới
   */
  static async create({ name, email, role = "Customer", status = "active" }) {
    try {
      // Tìm role_id
      const roleResult = await pool.query("SELECT role_id FROM roles WHERE LOWER(role_name) = LOWER($1)", [role]);
      const roleId = roleResult.rows[0]?.role_id || 3;

      const { rows } = await pool.query(
        `INSERT INTO users (role_id, full_name, email, password_hash, is_active)
         VALUES ($1, $2, $3, '$2b$10$w3.J./w/O5.4WnBq6g4h0.6r1W0VlG2m6m6g3u.Qh.Kq9O2jE/K', $4)
         RETURNING user_id AS id, full_name AS name, email, $5 AS role, $6 AS status`,
        [roleId, name, email, status === "active", role, status]
      );
      return rows[0];
    } catch (error) {
      const newUser = {
        id: inMemoryUsers.length + 1,
        name,
        email,
        role,
        status,
        createdAt: new Date(),
      };
      inMemoryUsers.push(newUser);
      return newUser;
    }
  }

  /**
   * Cập nhật người dùng
   */
  static async update(id, updateData) {
    try {
      const fields = [];
      const values = [];
      let idx = 1;

      if (updateData.name) {
        fields.push(`full_name = $${idx++}`);
        values.push(updateData.name);
      }
      if (updateData.email) {
        fields.push(`email = $${idx++}`);
        values.push(updateData.email);
      }
      if (updateData.status) {
        fields.push(`is_active = $${idx++}`);
        values.push(updateData.status === "active");
      }
      if (updateData.role) {
        const roleResult = await pool.query("SELECT role_id FROM roles WHERE LOWER(role_name) = LOWER($1)", [updateData.role]);
        if (roleResult.rows[0]) {
          fields.push(`role_id = $${idx++}`);
          values.push(roleResult.rows[0].role_id);
        }
      }

      if (fields.length === 0) return await this.findById(id);

      values.push(id);
      await pool.query(
        `UPDATE users SET ${fields.join(", ")} WHERE user_id = $${idx}`,
        values
      );
      return await this.findById(id);
    } catch (error) {
      const userIndex = inMemoryUsers.findIndex((u) => u.id === Number(id));
      if (userIndex !== -1) {
        inMemoryUsers[userIndex] = { ...inMemoryUsers[userIndex], ...updateData };
        return inMemoryUsers[userIndex];
      }
      return null;
    }
  }

  /**
   * Xóa người dùng (Soft delete)
   */
  static async delete(id) {
    try {
      const { rows } = await pool.query(
        "UPDATE users SET is_active = FALSE WHERE user_id = $1 RETURNING user_id AS id",
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      inMemoryUsers = inMemoryUsers.filter((u) => u.id !== Number(id));
      return { id: Number(id) };
    }
  }
}

module.exports = UserModel;
