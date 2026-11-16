const path = require("path");
const { Pool } = require("pg");
const dotenv = require("dotenv");

// Load .env from current directory or backend directory
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "postgres",
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
 * Hàm kiểm tra trạng thái kết nối Cơ sở dữ liệu PostgreSQL
 */
const testConnection = async () => {
  try {
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
