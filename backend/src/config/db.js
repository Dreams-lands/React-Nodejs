const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

// Tạo Connection Pool để tối ưu hiệu năng và quản lý kết nối
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "webql_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Hàm kiểm tra trạng thái kết nối Cơ sở dữ liệu
const testConnection = async () => {
  try {
    // 1. Đảm bảo Database tồn tại (Auto create DB nếu chưa có)
    try {
      const rootConn = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
      });
      const dbName = process.env.DB_NAME || "webql_db";
      await rootConn.query(
        `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await rootConn.end();
    } catch (createDbErr) {
      // Bỏ qua nếu user không đủ quyền tạo DB, sẽ thử kết nối trực tiếp pool
    }

    // 2. Kết nối lấy thử 1 connection từ pool
    const connection = await pool.getConnection();
    console.log(`✅ [Database] Kết nối MySQL thành công tới cơ sở dữ liệu: '${process.env.DB_NAME || "webql_db"}'!`);
    connection.release();
    return true;
  } catch (error) {
    console.warn("⚠️  [Database] Chưa thể kết nối tới MySQL:");
    console.warn(`    Lỗi: ${error.message}`);
    console.warn("    👉 Gợi ý: Hãy kiểm tra MySQL service và cấu hình tài khoản trong backend/.env");
    return false;
  }
};

module.exports = {
  pool,
  testConnection,
};
