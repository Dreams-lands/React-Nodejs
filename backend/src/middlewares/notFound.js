const { sendError } = require("../utils/response");

/**
 * Middleware xử lý khi không tìm thấy Route (404 Not Found)
 */
const notFound = (req, res, next) => {
  const message = `Không tìm thấy tài nguyên: ${req.method} ${req.originalUrl}`;
  return sendError(res, message, 404);
};

module.exports = notFound;
