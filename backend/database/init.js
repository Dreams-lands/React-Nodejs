const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'postgres',
};

async function initDatabase() {
  console.log('====================================================');
  console.log('🐾 Bắt đầu đồng bộ Cơ sở dữ liệu PetHub vào database "postgres"...');
  console.log(`📡 Máy chủ: ${config.host}:${config.port} | User: ${config.user} | Database: ${config.database}`);
  console.log('====================================================');

  let dbClient;

  try {
    // 1. Kết nối trực tiếp vào database 'postgres'
    dbClient = new Client(config);
    await dbClient.connect();
    console.log(`✅ 1. Kết nối tới PostgreSQL Database "${config.database}" thành công!`);

    // 2. Dọn dẹp/xóa database webql_db nếu còn tồn tại
    try {
      const checkWebql = await dbClient.query(
        "SELECT 1 FROM pg_database WHERE datname = 'webql_db'"
      );
      if (checkWebql.rowCount > 0) {
        console.log('🗑️  2. Phát hiện database thừa "webql_db", đang xóa bỏ...');
        await dbClient.query(`
          SELECT pg_terminate_backend(pg_stat_activity.pid)
          FROM pg_stat_activity
          WHERE pg_stat_activity.datname = 'webql_db'
            AND pid <> pg_backend_pid();
        `);
        await dbClient.query('DROP DATABASE IF EXISTS "webql_db" WITH (FORCE);');
        console.log('✅    Đã xóa sạch database "webql_db"!');
      } else {
        console.log('ℹ️  2. Database "webql_db" đã được dọn sạch.');
      }
    } catch (cleanErr) {
      // Bỏ qua lỗi ngắt kết nối nếu không có quyền
    }

    // 3. Thực thi schema.sql trực tiếp trên database 'postgres'
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Không tìm thấy file schema tại: ${schemaPath}`);
    }
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('⏳ 3. Đang thực thi cấu trúc 16 bảng & nạp dữ liệu vào "postgres"...');
    await dbClient.query(schemaSql);
    console.log('✅    Đã tạo thành công 16 bảng: roles, users, categories, products, product_images, inventory_logs, orders, order_items, services, appointments, transactions, carts, cart_items, banners, site_settings, audit_logs!');

    // 4. Kiểm tra số lượng bản ghi vừa tạo
    const userCount = await dbClient.query('SELECT COUNT(*) FROM users');
    const prodCount = await dbClient.query('SELECT COUNT(*) FROM products');
    const orderCount = await dbClient.query('SELECT COUNT(*) FROM orders');
    console.log(`📊    Users: ${userCount.rows[0].count} | Products: ${prodCount.rows[0].count} | Orders: ${orderCount.rows[0].count}`);

    console.log('====================================================');
    console.log('🎉 ĐỒNG BỘ DỮ LIỆU VÀO DATABASE "postgres" HOÀN TẤT!');
    console.log('🔍 Bạn có thể mở DBeaver, chọn database "postgres" để xem các bảng.');
    console.log('====================================================');
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo Cơ sở dữ liệu:');
    console.error(`   ${error.message}`);
    process.exit(1);
  } finally {
    if (dbClient) await dbClient.end().catch(() => {});
  }
}

initDatabase();
