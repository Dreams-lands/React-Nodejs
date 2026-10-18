const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const { testConnection } = require("./config/db");
const UserModel = require("./models/user.model");

const PORT = process.env.PORT || 5000;

// Khởi động server
const startServer = async () => {
  try {
    // 1. Kiểm tra kết nối Cơ sở dữ liệu PostgreSQL
    const isDbConnected = await testConnection();
    if (isDbConnected) {
      // Tự động kiểm tra/tạo bảng users và dữ liệu mẫu
      await UserModel.initTable();
    }

    // 2. Lắng nghe yêu cầu HTTP
    const server = app.listen(PORT, () => {
      console.log("==================================================");
      console.log(`🚀 Server Backend WebQL (MVC) đang chạy!`);
      console.log(`📡 URL API:      http://localhost:${PORT}/api`);
      console.log(`🏥 Healthcheck:  http://localhost:${PORT}/api/health`);
      console.log(`👥 Users API:    http://localhost:${PORT}/api/users`);
      console.log(`🌍 Môi trường:   ${process.env.NODE_ENV || "development"}`);
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
