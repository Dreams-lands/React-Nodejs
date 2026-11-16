const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = require("./app");
const { testConnection } = require("./config/db");

const PORT = process.env.PORT || 5000;

// Khởi động server
const startServer = async () => {
  try {
    // 1. Kiểm tra kết nối Cơ sở dữ liệu PostgreSQL
    await testConnection();

    // 2. Lắng nghe yêu cầu HTTP
    const server = app.listen(PORT, () => {
      console.log("==================================================");
      console.log(`🐾 Server Backend PetHub (MVC) đang chạy!`);
      console.log(`📡 URL API:        http://localhost:${PORT}/api`);
      console.log(`🏥 Healthcheck:    http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth API:       http://localhost:${PORT}/api/auth`);
      console.log(`🛍️  Products API:   http://localhost:${PORT}/api/products`);
      console.log(`📦 Orders API:     http://localhost:${PORT}/api/orders`);
      console.log(`🛒 Cart API:       http://localhost:${PORT}/api/cart`);
      console.log(`👥 Users API:      http://localhost:${PORT}/api/users`);
      console.log(`🌍 Môi trường:     ${process.env.NODE_ENV || "development"}`);
      console.log("==================================================");
    });

    // 3. Xử lý tắt server an toàn (Graceful Shutdown)
    const handleShutdown = (signal) => {
      console.log(`\n🛑 Nhận tín hiệu ${signal}. Đang đóng server an toàn...`);
      server.close(() => {
        console.log("🔒 Server đã dừng xử lý kết nối.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => handleShutdown("SIGTERM"));
    process.on("SIGINT", () => handleShutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Không thể khởi động server:", error);
    process.exit(1);
  }
};

startServer();
