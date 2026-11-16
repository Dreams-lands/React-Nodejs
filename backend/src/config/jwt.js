const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

module.exports = {
  // Cấu hình Access Token (ngắn hạn, dùng trong Authorization Header)
  accessSecret:
    process.env.JWT_ACCESS_SECRET ||
    process.env.JWT_SECRET ||
    "pethub_jwt_access_secret_key_2026",
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",

  // Cấu hình Refresh Token (dài hạn, lưu an toàn trong HttpOnly Cookie)
  refreshSecret:
    process.env.JWT_REFRESH_SECRET || "pethub_jwt_refresh_secret_key_2026",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  // Tên Cookie HttpOnly và thời hạn
  cookieName: "pethub_refresh_token",
  cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
};
