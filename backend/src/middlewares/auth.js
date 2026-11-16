const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/response");

const JWT_SECRET = process.env.JWT_SECRET || "pethub_jwt_secret_key_2026";

/**
 * Middleware xác thực JWT token
 * Lấy token từ header Authorization (Bearer xxx)
 * Verify token và gán decoded payload vào req.user
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "Không tìm thấy token xác thực", 401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendError(res, "Token đã hết hạn, vui lòng đăng nhập lại", 401);
    }
    if (error.name === "JsonWebTokenError") {
      return sendError(res, "Token không hợp lệ", 401);
    }
    return sendError(res, "Lỗi xác thực", 401);
  }
};

/**
 * Middleware phân quyền theo role
 * Kiểm tra req.user.role_name có nằm trong danh sách roles cho phép không
 * Sử dụng: authorize("Admin", "Staff")
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Chưa xác thực, vui lòng đăng nhập", 401);
    }

    if (!roles.includes(req.user.role_name)) {
      return sendError(
        res,
        "Bạn không có quyền truy cập tài nguyên này",
        403
      );
    }

    next();
  };
};

module.exports = {
  verifyToken,
  authorize,
};
