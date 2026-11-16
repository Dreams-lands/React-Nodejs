const path = require('path');
const { Client } = require('../backend/node_modules/pg');
const dotenv = require('../backend/node_modules/dotenv');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: 'postgres',
};

async function main() {
  console.log('📡 Đang kết nối vào database mặc định "postgres"...');
  const client = new Client(config);
  await client.connect();
  console.log('✅ Đã kết nối thành công tới database "postgres"!');

  // 1. Kiểm tra danh sách databases
  const checkDb = await client.query(
    "SELECT datname FROM pg_database WHERE datname IN ('postgres', 'webql_db')"
  );
  console.log('📋 Danh sách databases hiện tại:', checkDb.rows.map(r => r.datname));

  // 2. Nếu webql_db tồn tại -> Ngắt kết nối và XÓA (DROP DATABASE webql_db)
  const hasWebql = checkDb.rows.some(r => r.datname === 'webql_db');
  if (hasWebql) {
    console.log('🗑️  Đang ngắt kết nối và XÓA database "webql_db"...');
    // Ngắt các session đang kết nối vào webql_db
    await client.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = 'webql_db'
        AND pid <> pg_backend_pid();
    `);
    // Xóa database webql_db
    await client.query('DROP DATABASE IF EXISTS "webql_db" WITH (FORCE);');
    console.log('✅ ĐÃ XÓA THÀNH CÔNG DATABASE "webql_db"!');
  } else {
    console.log('ℹ️  Database "webql_db" không tồn tại hoặc đã bị xóa.');
  }

  // 3. Đọc và thực thi schema.sql trực tiếp trên database "postgres"
  const fs = require('fs');
  const schemaPath = path.join(__dirname, '../backend/database/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('⏳ Đang đồng bộ hóa 16 bảng dữ liệu PetHub vào database "postgres"...');
  await client.query(schemaSql);
  console.log('✅ ĐÃ ĐỒNG BỘ THÀNH CÔNG 16 BẢNG DỮ LIỆU VÀO DATABASE "postgres"!');

  // 4. Kiểm tra số lượng bản ghi
  const userCount = await client.query('SELECT COUNT(*) FROM users');
  const prodCount = await client.query('SELECT COUNT(*) FROM products');
  const orderCount = await client.query('SELECT COUNT(*) FROM orders');
  console.log(`📊 Users: ${userCount.rows[0].count} | Products: ${prodCount.rows[0].count} | Orders: ${orderCount.rows[0].count}`);

  await client.end();
  console.log('🎉 HOÀN TẤT CHUYỂN ĐỔI SANG DATABASE "postgres"!');
}

main().catch((err) => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
