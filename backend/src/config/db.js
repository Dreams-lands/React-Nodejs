const { Pool, Client } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "webql_db",
  max: 10, // Giới hạn connection pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

// Tạo Connection Pool cho PostgreSQL
const pool = new Pool(dbConfig);

// Lắng nghe sự kiện lỗi ngoài ý muốn trên client rảnh
pool.on("error", (err) => {
  console.error("🔥 [PostgreSQL Pool Error]:", err.message);
});

/**
 * Đảm bảo Database PostgreSQL tồn tại (Tự tạo nếu chưa có)
 */
const ensureDatabaseExists = async () => {
  const targetDb = dbConfig.database;
  let client;
  try {
    // Kết nối đến database mặc định 'postgres' để kiểm tra
    client = new Client({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: "postgres",
    });
    await client.connect();

    const checkRes = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [targetDb]
    );

    if (checkRes.rowCount === 0) {
      console.log(`📦 [PostgreSQL] Database '${targetDb}' chưa tồn tại. Đang tự động tạo...`);
      // Cần escape định danh tên database
      await client.query(`CREATE DATABASE "${targetDb}" WITH ENCODING 'UTF8';`);
      console.log(`✅ [PostgreSQL] Đã tạo database '${targetDb}' thành công!`);
    }
  } catch (error) {
    // Bỏ qua lỗi nếu không đủ quyền, sẽ thử kết nối trực tiếp pool
  } finally {
    if (client) {
      await client.end().catch(() => {});
    }
  }
};

/**
 * Hàm kiểm tra trạng thái kết nối Cơ sở dữ liệu PostgreSQL
 */
const testConnection = async () => {
  try {
    // 1. Kiểm tra/Tạo database nếu chưa tồn tại
    await ensureDatabaseExists();

    // 2. Thử lấy kết nối từ Pool
    const client = await pool.connect();
    const result = await client.query("SELECT NOW() as current_time, version()");
    console.log(`✅ [Database] Kết nối PostgreSQL thành công tới database: '${dbConfig.database}'!`);
    console.log(`   🕒 Server Time: ${result.rows[0].current_time}`);
    client.release();
    return true;
  } catch (error) {
    console.warn("⚠️  [Database] Chưa thể kết nối tới PostgreSQL:");
    console.warn(`    Lỗi: ${error.message}`);
    console.warn("    👉 Gợi ý: Hãy kiểm tra PostgreSQL service (Port 5432) và thông số trong file backend/.env");
    return false;
  }
};

module.exports = {
  pool,
  testConnection,
  query: (text, params) => pool.query(text, params),
};
