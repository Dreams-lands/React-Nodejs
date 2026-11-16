const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AuthModel = require("../models/auth.model");

const JWT_SECRET = process.env.JWT_SECRET || "pethub_jwt_secret_key_2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * AuthService (Tầng Service - Xác thực)
 * Chứa logic nghiệp vụ: login, register, getProfile
 */
class AuthService {
  /**
   * Tạo JWT token
   */
  static generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * Đăng nhập
   * - Kiểm tra email tồn tại
   * - Kiểm tra tài khoản còn hoạt động (is_active)
   * - So sánh mật khẩu bằng bcrypt
   * - Trả về user info + JWT token
   */
  static async login(email, password) {
    // Kiểm tra email
    if (!email || !password) {
      const error = new Error("Email và mật khẩu không được để trống");
      error.statusCode = 400;
      throw error;
    }

    const user = await AuthModel.findByEmail(email);
    if (!user) {
      const error = new Error("Email hoặc mật khẩu không chính xác");
      error.statusCode = 401;
      throw error;
    }

    // Kiểm tra tài khoản có hoạt động không
    if (!user.is_active) {
      const error = new Error("Tài khoản đã bị vô hiệu hóa");
      error.statusCode = 403;
      throw error;
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const error = new Error("Email hoặc mật khẩu không chính xác");
      error.statusCode = 401;
      throw error;
    }

    // Tạo JWT token
    const token = this.generateToken({
      user_id: user.user_id,
      role_id: user.role_id,
      role_name: user.role_name,
    });

    // Trả về user info (không kèm password_hash)
    const { password_hash, ...userInfo } = user;
    return { user: userInfo, token };
  }

  /**
   * Đăng ký tài khoản mới
   * - Kiểm tra email chưa tồn tại
   * - Hash mật khẩu
   * - Tạo user với role_id = 3 (Customer)
   * - Trả về user info + JWT token
   */
  static async register({ full_name, email, password, phone, address }) {
    // Validate đầu vào
    if (!full_name || !full_name.trim()) {
      const error = new Error("Họ tên không được để trống");
      error.statusCode = 400;
      throw error;
    }

    if (!email || !email.trim()) {
      const error = new Error("Email không được để trống");
      error.statusCode = 400;
      throw error;
    }

    if (!password || password.length < 6) {
      const error = new Error("Mật khẩu phải có ít nhất 6 ký tự");
      error.statusCode = 400;
      throw error;
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await AuthModel.findByEmail(email);
    if (existingUser) {
      const error = new Error("Email này đã được sử dụng");
      error.statusCode = 409;
      throw error;
    }

    // Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Tạo user mới với role_id = 3 (Customer)
    const newUser = await AuthModel.createUser({
      role_id: 3,
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      password_hash,
      phone: phone || null,
      address: address || null,
    });

    // Tạo JWT token
    const token = this.generateToken({
      user_id: newUser.user_id,
      role_id: newUser.role_id,
      role_name: "Customer",
    });

    // Trả về user info (không kèm password_hash)
    const { password_hash: _, ...userInfo } = newUser;
    return { user: userInfo, token };
  }

  /**
   * Lấy thông tin profile (không trả password)
   */
  static async getProfile(userId) {
    const user = await AuthModel.findById(userId);
    if (!user) {
      const error = new Error("Không tìm thấy người dùng");
      error.statusCode = 404;
      throw error;
    }
    return user;
  }
}

module.exports = AuthService;
