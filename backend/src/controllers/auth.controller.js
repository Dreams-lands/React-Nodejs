const AuthService = require("../services/auth.service");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * AuthController (Tầng Controller - Xác thực)
 * Tiếp nhận HTTP Request, gọi AuthService và phản hồi HTTP Response
 */
class AuthController {
  /**
   * [POST] /api/auth/login - Đăng nhập
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return sendSuccess(res, result, "Đăng nhập thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [POST] /api/auth/register - Đăng ký tài khoản
   */
  static async register(req, res, next) {
    try {
      const { full_name, email, password, phone, address } = req.body;
      const result = await AuthService.register({
        full_name,
        email,
        password,
        phone,
        address,
      });
      return sendSuccess(res, result, "Đăng ký tài khoản thành công", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/auth/me - Lấy thông tin profile (cần đăng nhập)
   */
  static async getProfile(req, res, next) {
    try {
      const userId = req.user.user_id;
      const user = await AuthService.getProfile(userId);
      return sendSuccess(res, user, "Lấy thông tin cá nhân thành công");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
