const { verifyAccessToken } = require("../utils/jwt");
const { sendError } = require("../utils/response");

/**
 * Middleware xác thực token JWT bắt buộc (Authentication Middleware)
 * Hỗ trợ lấy Token từ:
 * 1. Authorization Header: Bearer <token>
 * 2. Cookie: pethub_access_token (nếu có)
 */
const authenticate = (req, res, next) => {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.pethub_access_token) {
    token = req.cookies.pethub_access_token;
  }

  if (!token) {
    return sendError(res, "Vui lòng đăng nhập để thực hiện chức năng này", 401);
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return sendError(res, "Phiên đăng nhập đã hết hạn hoặc không hợp lệ", 401);
  }

  req.user = decoded;
  next();
};

/**
 * Middleware xác thực tùy chọn (Optional Authentication)
 * Dành cho các chức năng phục vụ cả khách vãng lai và thành viên đã đăng nhập (như Đặt hàng)
 */
const optionalAuth = (req, res, next) => {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.pethub_access_token) {
    token = req.cookies.pethub_access_token;
  }

  if (token) {
    const decoded = verifyAccessToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
};

/**
 * Middleware phân quyền vai trò (Role-based Access Control - RBAC)
 * @param  {...string} allowedRoles Danh sách các quyền được phép, ví dụ: 'Admin', 'Staff'
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Yêu cầu đăng nhập trước khi truy cập", 401);
    }

    const currentRole = (
      req.user.role_name ||
      (req.user.role_id === 1
        ? "Admin"
        : req.user.role_id === 2
        ? "Manager"
        : req.user.role_id === 3
        ? "Staff"
        : "Customer")
    ).toLowerCase();

    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

    if (!normalizedAllowed.includes(currentRole)) {
      return sendError(
        res,
        `Bạn không có quyền thực hiện thao tác này (Yêu cầu vai trò: ${allowedRoles.join(", ")})`,
        403
      );
    }

    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
};
