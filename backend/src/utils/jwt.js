const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");

/**
 * Sinh Access Token (Thời hạn ngắn, ví dụ 15m)
 * Dùng cho các yêu cầu xác thực API thường xuyên qua Authorization Header
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, jwtConfig.accessSecret, {
    expiresIn: jwtConfig.accessExpiresIn,
  });
};

/**
 * Sinh Refresh Token (Thời hạn dài, ví dụ 7 ngày)
 * Lưu an toàn trong HttpOnly Cookie để tái cấp Access Token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(
    { user_id: payload.user_id, type: "refresh" },
    jwtConfig.refreshSecret,
    { expiresIn: jwtConfig.refreshExpiresIn }
  );
};

/**
 * Sinh đồng thời cặp Access Token và Refresh Token
 */
const generateTokenPair = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  return { accessToken, refreshToken };
};

/**
 * Xác thực Access Token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.accessSecret);
  } catch (error) {
    return null;
  }
};

/**
 * Xác thực Refresh Token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.refreshSecret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  // Tương thích ngược với các module hiện có
  generateToken: generateAccessToken,
  verifyToken: verifyAccessToken,
};
