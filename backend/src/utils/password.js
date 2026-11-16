const bcrypt = require("bcryptjs");

/**
 * Mã hóa mật khẩu plain text với salt
 */
const hashPassword = async (plainPassword) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainPassword, salt);
};

/**
 * So sánh mật khẩu nhập vào với chuỗi hash trong database
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  if (!plainPassword || !hashedPassword) return false;
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword,
};
