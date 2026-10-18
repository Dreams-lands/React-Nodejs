const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const dotenv = require('dotenv');

// Nạp file .env từ thư mục backend
dotenv.config({ path: path.join(__dirname, '../.env') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
};

const targetDatabase = process.env.DB_NAME || 'webql_db';

async function initDatabase() {
  console.log('====================================================');
  console.log('🐘 Bắt đầu quá trình khởi tạo Cơ sở dữ liệu PostgreSQL...');
  console.log(`📡 Máy chủ: ${config.host}:${config.port} | User: ${config.user} | Database: ${targetDatabase}`);
  console.log('====================================================');

  let adminClient;
  let dbClient;

  try {
    // 1. Kết nối vào database quản trị mặc định 'postgres' để kiểm tra và tạo database
    adminClient = new Client({
      ...config,
      database: 'postgres',
    });
    await adminClient.connect();
    console.log('✅ 1. Kết nối tới máy chủ PostgreSQL (mặc định postgres) thành công!');

    const checkDb = await adminClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [targetDatabase]
    );

    if (checkDb.rowCount === 0) {
      console.log(`⏳    Database "${targetDatabase}" chưa tồn tại. Đang tạo mới...`);
      await adminClient.query(`CREATE DATABASE "${targetDatabase}" WITH ENCODING 'UTF8';`);
      console.log(`✅    Đã tạo database "${targetDatabase}" thành công!`);
    } else {
      console.log(`ℹ️    Database "${targetDatabase}" đã tồn tại sẵn.`);
    }

    await adminClient.end();
    adminClient = null;

    // 2. Kết nối trực tiếp vào database đích (webql_db)
    dbClient = new Client({
      ...config,
      database: targetDatabase,
    });
    await dbClient.connect();
    console.log(`✅ 2. Kết nối trực tiếp tới "${targetDatabase}" thành công!`);

    // 3. Đọc và thực thi schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Không tìm thấy file schema tại: ${schemaPath}`);
    }
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('⏳ 3. Đang thực thi cấu trúc bảng (schema.sql)...');
    await dbClient.query(schemaSql);
    console.log('✅    Đã tạo các bảng (users, categories, products), triggers và chỉ mục thành công!');

    // 4. Đọc và thực thi seed.sql
    const seedPath = path.join(__dirname, 'seed.sql');
    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      console.log('⏳ 4. Đang nạp dữ liệu mẫu ban đầu (seed.sql)...');
      await dbClient.query(seedSql);
      console.log('✅    Đã nạp dữ liệu mẫu thành công!');
    }

    console.log('====================================================');
    console.log('🎉 KHỞI TẠO CƠ SỞ DỮ LIỆU POSTGRESQL HOÀN TẤT!');
    console.log('🔍 Bạn có thể mở DBeaver và kết nối tới database để kiểm tra.');
    console.log('👉 Khởi động Backend với: npm run dev');
    console.log('====================================================');
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo Cơ sở dữ liệu PostgreSQL:');
    console.error(`   ${error.message}`);
    console.error('\n👉 Gợi ý khắc phục:');
    console.error('   1. Đảm bảo dịch vụ PostgreSQL đang chạy (Port 5432).');
    console.error('   2. Kiểm tra thông tin DB_USER và DB_PASSWORD trong file backend/.env');
    process.exit(1);
  } finally {
    if (adminClient) {
      await adminClient.end().catch(() => {});
    }
    if (dbClient) {
      await dbClient.end().catch(() => {});
    }
  }
}

initDatabase();
