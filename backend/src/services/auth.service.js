const UserModel = require("../models/user.model");
const EmailService = require("./email.service");
const { hashPassword, comparePassword } = require("../utils/password");
const { generateTokenPair, verifyRefreshToken } = require("../utils/jwt");

/**
 * AuthService (Tầng Service)
 * Xử lý nghiệp vụ đăng ký, đăng nhập, bảo mật và thông tin tài khoản
 */
class AuthService {
  /**
   * Đăng ký tài khoản hội viên mới
   * - Kiểm tra trùng lặp email
   * - Băm mật khẩu bằng Bcrypt
   * - Lưu vào cơ sở dữ liệu PostgreSQL
   * - Sinh cặp Access Token (15m) & Refresh Token (7d)
   * - Gửi email chào mừng thương hiệu PetHub
   */
  static async register({ full_name, email, password, phone, address }) {
    if (!full_name || !full_name.trim()) {
      const error = new Error("Họ và tên không được để trống");
      error.statusCode = 400;
      throw error;
    }

    if (!email || !email.trim()) {
      const error = new Error("Địa chỉ email không được để trống");
      error.statusCode = 400;
      throw error;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      const error = new Error("Định dạng email không hợp lệ");
      error.statusCode = 400;
      throw error;
    }

    if (!password || password.length < 6) {
      const error = new Error("Mật khẩu phải chứa ít nhất 6 ký tự");
      error.statusCode = 400;
      throw error;
    }

    // 1. Kiểm tra trùng lặp email trong cơ sở dữ liệu
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      const error = new Error("Email này đã được đăng ký tài khoản");
      error.statusCode = 409;
      throw error;
    }

    // 2. Hash mật khẩu an toàn với bcrypt (salt = 10)
    const password_hash = await hashPassword(password);

    // 3. Tạo user mới với quyền Customer (tự động lấy role_id đúng của Customer)
    const customerRoleId = await UserModel.getRoleIdByName("Customer");
    const newUser = await UserModel.create({
      role_id: customerRoleId,
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      password_hash,
      phone: phone ? phone.trim() : null,
      address: address ? address.trim() : null,
    });

    const userPayload = {
      user_id: newUser.user_id,
      role_id: newUser.role_id,
      role_name: "Customer",
      email: newUser.email,
      full_name: newUser.full_name,
    };

    // 4. Sinh cặp Access Token và Refresh Token
    const { accessToken, refreshToken } = generateTokenPair(userPayload);

    // 5. Gửi email chào mừng hội viên (Bất đồng bộ, không làm gián đoạn phản hồi)
    EmailService.sendWelcomeEmail({
      to: newUser.email,
      fullName: newUser.full_name,
    }).catch((err) => {
      console.warn("⚠️ [EmailService Warning]:", err.message);
    });

    return {
      user: {
        user_id: newUser.user_id,
        role_id: newUser.role_id,
        role_name: "Customer",
        full_name: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        address: newUser.address,
        avatar_url: newUser.avatar_url,
      },
      accessToken,
      refreshToken,
      token: accessToken, // Tương thích ngược
    };
  }

  /**
   * Đăng nhập bằng Email hoặc Số điện thoại
   * - Xác thực mật khẩu Bcrypt
   * - Sinh cặp Access Token & Refresh Token
   */
  static async login({ email, password }) {
    if (!email || !password) {
      const error = new Error("Vui lòng nhập tài khoản (email/số điện thoại) và mật khẩu");
      error.statusCode = 400;
      throw error;
    }

    // Tìm kiếm trong database theo Email hoặc Số điện thoại
    const user = await UserModel.findByEmailOrPhone(email);
    if (!user) {
      const error = new Error("Tài khoản hoặc mật khẩu không chính xác");
      error.statusCode = 401;
      throw error;
    }

    if (!user.is_active) {
      const error = new Error("Tài khoản của bạn đã bị khóa hoặc tạm ngưng");
      error.statusCode = 403;
      throw error;
    }

    // So khớp mật khẩu đã hash bằng bcrypt.compare
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      const error = new Error("Tài khoản hoặc mật khẩu không chính xác");
      error.statusCode = 401;
      throw error;
    }

    const userPayload = {
      user_id: user.user_id,
      role_id: user.role_id,
      role_name: user.role_name,
      email: user.email,
      full_name: user.full_name,
    };

    // Sinh cặp Access Token và Refresh Token
    const { accessToken, refreshToken } = generateTokenPair(userPayload);

    return {
      user: {
        user_id: user.user_id,
        role_id: user.role_id,
        role_name: user.role_name,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        avatar_url: user.avatar_url,
      },
      accessToken,
      refreshToken,
      token: accessToken, // Tương thích ngược
    };
  }

  /**
   * Tái cấp Access Token mới từ Refresh Token
   */
  static async refreshAccessToken(refreshTokenString) {
    if (!refreshTokenString) {
      const error = new Error("Vui lòng cung cấp Refresh Token");
      error.statusCode = 401;
      throw error;
    }

    const decoded = verifyRefreshToken(refreshTokenString);
    if (!decoded || !decoded.user_id) {
      const error = new Error("Refresh Token không hợp lệ hoặc đã hết hạn");
      error.statusCode = 401;
      throw error;
    }

    // Kiểm tra user trong database
    const user = await UserModel.findById(decoded.user_id);
    if (!user || !user.is_active) {
      const error = new Error("Người dùng không còn hoạt động trên hệ thống");
      error.statusCode = 403;
      throw error;
    }

    const userPayload = {
      user_id: user.user_id,
      role_id: user.role_id,
      role_name: user.role_name,
      email: user.email,
      full_name: user.full_name,
    };

    // Sinh cặp token mới (kèm refresh token rotation)
    const { accessToken, refreshToken } = generateTokenPair(userPayload);

    return {
      accessToken,
      refreshToken,
      user: {
        user_id: user.user_id,
        role_id: user.role_id,
        role_name: user.role_name,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        avatar_url: user.avatar_url,
      },
    };
  }

  /**
   * Lấy thông tin cá nhân hiện tại
   */
  static async getProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      const error = new Error("Không tìm thấy người dùng");
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  /**
   * Cập nhật thông tin cá nhân
   */
  static async updateProfile(userId, { full_name, phone, address, avatar_url }) {
    const updated = await UserModel.update(userId, {
      full_name,
      phone,
      address,
      avatar_url,
    });
    return updated;
  }

  /**
   * Đổi mật khẩu
   */
  static async changePassword(userId, { current_password, new_password }) {
    if (!new_password || new_password.length < 6) {
      const error = new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
      error.statusCode = 400;
      throw error;
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      const error = new Error("Không tìm thấy người dùng");
      error.statusCode = 404;
      throw error;
    }

    const fullUser = await UserModel.findByEmail(user.email);
    const isMatch = await comparePassword(current_password, fullUser.password_hash);
    if (!isMatch) {
      const error = new Error("Mật khẩu hiện tại không đúng");
      error.statusCode = 400;
      throw error;
    }

    const newHash = await hashPassword(new_password);
    await UserModel.updatePassword(userId, newHash);
    return true;
  }
}

module.exports = AuthService;
