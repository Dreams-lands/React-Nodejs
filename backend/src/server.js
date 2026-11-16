const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "../.env") });

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

    // 3. Giữ event loop luôn active trong môi trường dev
    setInterval(() => {}, 1000 * 60 * 60);

    // Xử lý tắt server an toàn khi có signal rõ ràng
    process.on("SIGINT", () => {
      console.log("\n🛑 Nhận SIGINT. Đóng server...");
      server.close(() => process.exit(0));
    });
  } catch (error) {
    console.error("❌ Không thể khởi động server:", error);
    process.exit(1);
  }
};

startServer();
