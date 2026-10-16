const { pool } = require("../config/db");

/**
 * UserModel (Tầng Model trong MVC)
 * Chịu trách nhiệm trực tiếp tương tác với bảng `users` trong Cơ sở dữ liệu MySQL
 */

// Bộ nhớ đệm tạm thời (In-memory fallback) phòng khi MySQL chưa kết nối được
let inMemoryUsers = [
  { id: 1, name: "Nguyễn Văn An", email: "an.nguyen@example.com", role: "admin", status: "active", createdAt: new Date() },
  { id: 2, name: "Trần Thị Bích", email: "bich.tran@example.com", role: "editor", status: "active", createdAt: new Date() },
  { id: 3, name: "Lê Hoàng Cường", email: "cuong.le@example.com", role: "user", status: "active", createdAt: new Date() },
];

class UserModel {
  /**
   * Khởi tạo bảng users nếu chưa tồn tại (Auto migration)
   */
  static async initTable() {
    try {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          role ENUM('admin', 'editor', 'user') DEFAULT 'user',
          status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_users_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;
      await pool.query(createTableQuery);

      const [rows] = await pool.query("SELECT COUNT(*) as count FROM users");
      if (rows[0].count === 0) {
        const seedQuery = `
          INSERT INTO users (name, email, role, status) VALUES 
          ('Nguyễn Văn An', 'an.nguyen@example.com', 'admin', 'active'),
          ('Trần Thị Bích', 'bich.tran@example.com', 'editor', 'active'),
          ('Lê Hoàng Cường', 'cuong.le@example.com', 'user', 'active');
        `;
        await pool.query(seedQuery);
        console.log("🌱 [Database] Bảng 'users' đã có dữ liệu khởi tạo.");
      }
    } catch (error) {
      console.warn("⚠️  [Model] Lỗi kiểm tra bảng users:", error.message);
    }
  }

  /**
   * Lấy danh sách tất cả người dùng
   */
  static async findAll() {
    try {
      const [rows] = await pool.query(
        "SELECT id, name, email, role, status, created_at as createdAt, updated_at as updatedAt FROM users ORDER BY id DESC"
      );
      return rows;
    } catch (error) {
      console.warn("⚠️  [Model] Dùng dữ liệu in-memory fallback:", error.message);
      return inMemoryUsers;
    }
  }

  /**
   * Lấy thông tin người dùng theo ID
   */
  static async findById(id) {
    try {
      const [rows] = await pool.query(
        "SELECT id, name, email, role, status, created_at as createdAt, updated_at as updatedAt FROM users WHERE id = ?",
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
      const [rows] = await pool.query(
        "SELECT id, name, email, role, status FROM users WHERE email = ?",
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      return inMemoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
    }
  }

  /**
   * Thêm người dùng mới
   */
  static async create({ name, email, role = "user", status = "active" }) {
    try {
      const [result] = await pool.query(
        "INSERT INTO users (name, email, role, status) VALUES (?, ?, ?, ?)",
        [name, email, role, status]
      );
      return this.findById(result.insertId);
    } catch (error) {
      const newUser = {
        id: inMemoryUsers.length > 0 ? Math.max(...inMemoryUsers.map((u) => u.id)) + 1 : 1,
        name,
        email,
        role,
        status,
        createdAt: new Date(),
      };
      inMemoryUsers.unshift(newUser);
      return newUser;
    }
  }

  /**
   * Cập nhật thông tin người dùng
   */
  static async update(id, { name, email, role, status }) {
    try {
      await pool.query(
        "UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role), status = COALESCE(?, status) WHERE id = ?",
        [name, email, role, status, id]
      );
      return this.findById(id);
    } catch (error) {
      const index = inMemoryUsers.findIndex((u) => u.id === Number(id));
      if (index !== -1) {
        inMemoryUsers[index] = {
          ...inMemoryUsers[index],
          name: name || inMemoryUsers[index].name,
          email: email || inMemoryUsers[index].email,
          role: role || inMemoryUsers[index].role,
          status: status || inMemoryUsers[index].status,
        };
        return inMemoryUsers[index];
      }
      return null;
    }
  }

  /**
   * Xóa người dùng theo ID
   */
  static async delete(id) {
    try {
      const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      const initialLen = inMemoryUsers.length;
      inMemoryUsers = inMemoryUsers.filter((u) => u.id !== Number(id));
      return inMemoryUsers.length < initialLen;
    }
  }
}

module.exports = UserModel;
