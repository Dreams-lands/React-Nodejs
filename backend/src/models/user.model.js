const { pool } = require("../config/db");

/**
 * UserModel (Tầng Model trong kiến trúc MVC)
 * Tương tác trực tiếp với bảng `users` trong Cơ sở dữ liệu PostgreSQL
 */

// Bộ nhớ đệm tạm thời (In-memory fallback) phòng khi PostgreSQL chưa bật
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
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user')),
          status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      `;
      await pool.query(createTableQuery);

      const countResult = await pool.query("SELECT COUNT(*) as count FROM users");
      if (parseInt(countResult.rows[0].count, 10) === 0) {
        const seedQuery = `
          INSERT INTO users (name, email, role, status) VALUES 
          ('Nguyễn Văn An', 'an.nguyen@example.com', 'admin', 'active'),
          ('Trần Thị Bích', 'bich.tran@example.com', 'editor', 'active'),
          ('Lê Hoàng Cường', 'cuong.le@example.com', 'user', 'active')
          ON CONFLICT (email) DO NOTHING;
        `;
        await pool.query(seedQuery);
        console.log("🌱 [PostgreSQL] Bảng 'users' đã có dữ liệu khởi tạo.");
      }
    } catch (error) {
      console.warn("⚠️  [Model] Lỗi kiểm tra bảng users trong PostgreSQL:", error.message);
    }
  }

  /**
   * Lấy danh sách tất cả người dùng
   */
  static async findAll() {
    try {
      const { rows } = await pool.query(
        'SELECT id, name, email, role, status, created_at AS "createdAt", updated_at AS "updatedAt" FROM users ORDER BY id DESC'
      );
      return rows;
    } catch (error) {
      console.warn("⚠️  [Model] Dùng dữ liệu in-memory fallback (do PostgreSQL chưa kết nối):", error.message);
      return inMemoryUsers;
    }
  }

  /**
   * Lấy thông tin người dùng theo ID
   */
  static async findById(id) {
    try {
      const { rows } = await pool.query(
        'SELECT id, name, email, role, status, created_at AS "createdAt", updated_at AS "updatedAt" FROM users WHERE id = $1',
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
        'SELECT id, name, email, role, status, created_at AS "createdAt", updated_at AS "updatedAt" FROM users WHERE LOWER(email) = LOWER($1)',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      return inMemoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
    }
  }

  /**
   * Thêm người dùng mới (Dùng RETURNING của PostgreSQL để lấy ngay bản ghi vừa tạo)
   */
  static async create({ name, email, role = "user", status = "active" }) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO users (name, email, role, status)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role, status, created_at AS "createdAt", updated_at AS "updatedAt"`,
        [name, email, role, status]
      );
      return rows[0];
    } catch (error) {
      const newUser = {
        id: inMemoryUsers.length > 0 ? Math.max(...inMemoryUsers.map((u) => u.id)) + 1 : 1,
        name,
        email,
        role,
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryUsers.unshift(newUser);
      return newUser;
    }
  }

  /**
   * Cập nhật thông tin người dùng (Dùng RETURNING của PostgreSQL)
   */
  static async update(id, { name, email, role, status }) {
    try {
      const { rows } = await pool.query(
        `UPDATE users
         SET name = COALESCE($1, name),
             email = COALESCE($2, email),
             role = COALESCE($3, role),
             status = COALESCE($4, status)
         WHERE id = $5
         RETURNING id, name, email, role, status, created_at AS "createdAt", updated_at AS "updatedAt"`,
        [name, email, role, status, id]
      );
      return rows[0] || null;
    } catch (error) {
      const index = inMemoryUsers.findIndex((u) => u.id === Number(id));
      if (index !== -1) {
        inMemoryUsers[index] = {
          ...inMemoryUsers[index],
          name: name || inMemoryUsers[index].name,
          email: email || inMemoryUsers[index].email,
          role: role || inMemoryUsers[index].role,
          status: status || inMemoryUsers[index].status,
          updatedAt: new Date(),
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
      const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);
      return result.rowCount > 0;
    } catch (error) {
      const initialLen = inMemoryUsers.length;
      inMemoryUsers = inMemoryUsers.filter((u) => u.id !== Number(id));
      return inMemoryUsers.length < initialLen;
    }
  }
}

module.exports = UserModel;
