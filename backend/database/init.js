const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

// Nạp file .env từ thư mục backend
dotenv.config({ path: path.join(__dirname, "../.env") });

const config = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  multipleStatements: true, // Cho phép thực thi nhiều câu lệnh SQL trong một lần query
};

async function initDatabase() {
  console.log("====================================================");
  console.log("🔄 Bắt đầu quá trình khởi tạo Cơ sở dữ liệu MySQL...");
  console.log(
    `📡 Máy chủ: ${config.host}:${config.port} | User: ${config.user}`,
  );
  console.log("====================================================");

  let connection;
  try {
    // 1. Kết nối đến MySQL Server (chưa chỉ định database để có thể tạo mới)
    connection = await mysql.createConnection(config);
    console.log("✅ 1. Kết nối tới máy chủ MySQL thành công!");

    // 2. Đọc và thực thi file schema.sql
    const schemaPath = path.join(__dirname, "schema.sql");
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Không tìm thấy file schema tại: ${schemaPath}`);
    }
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    console.log("⏳ 2. Đang thực thi cấu trúc bảng (schema.sql)...");
    await connection.query(schemaSql);
    console.log(
      '✅    Đã tạo Database "webql_db" và các bảng (users, categories, products) thành công!',
    );

    // 3. Đọc và thực thi file seed.sql (nếu có cờ --seed hoặc mặc định khi tạo mới)
    const seedPath = path.join(__dirname, "seed.sql");
    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, "utf8");
      console.log("⏳ 3. Đang nạp dữ liệu mẫu ban đầu (seed.sql)...");
      await connection.query(seedSql);
      console.log("✅    Đã nạp dữ liệu mẫu thành công!");
    }

    console.log("====================================================");
    console.log("🎉 KHỞI TẠO CƠ SỞ DỮ LIỆU MYSQL HOÀN TẤT!");
    console.log("👉 Bây giờ bạn có thể khởi động lại Backend với: npm run dev");
    console.log("====================================================");
  } catch (error) {
    console.error("❌ Lỗi khi khởi tạo Cơ sở dữ liệu:");
    console.error(`   ${error.message}`);
    console.error("\n👉 Gợi ý khắc phục:");
    console.error(
      "   1. Đảm bảo MySQL service (XAMPP / Laragon / MySQL Server) đang chạy.",
    );
    console.error(
      "   2. Kiểm tra thông tin DB_USER và DB_PASSWORD trong file backend/.env",
    );
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
