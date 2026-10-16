/**
 * Chuẩn hóa định dạng phản hồi API (Standardized API Response)
 */

const sendSuccess = (
  res,
  data = null,
  message = "Thành công",
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

const sendError = (
  res,
  message = "Có lỗi xảy ra",
  statusCode = 500,
  errors = null,
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
