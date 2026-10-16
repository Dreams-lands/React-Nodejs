const { sendError } = require("../utils/response");

/**
 * Middleware xử lý lỗi tập trung (Global Error Handler)
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error("🔥 [Error Handler]:", err);

  const statusCode =
    err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const message = err.message || "Lỗi máy chủ nội bộ (Internal Server Error)";

  return sendError(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === "development" ? { stack: err.stack } : null,
  );
};

module.exports = errorHandler;
