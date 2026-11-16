const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // 1. Cho phép requests không có origin (curl, mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);

    // 2. Cho phép MỌI localhost và 127.0.0.1 trên bất kỳ cổng nào (5173, 5174, 5175, 3000,...)
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    // 3. Whitelist theo cấu hình production/domain
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Trả về false an toàn thay vì ném Error gây crash router
    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

module.exports = corsOptions;
