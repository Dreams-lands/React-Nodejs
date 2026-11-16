const AuthService = require("../services/auth.service");
const { sendSuccess, sendError } = require("../utils/response");

const REFRESH_COOKIE_NAME = "pethub_refresh_token";

const cookieOptions = {
  httpOnly: true, // Bảo vệ chống tấn công XSS (JavaScript trình duyệt không đọc được)
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
  path: "/",
};

/**
 * AuthController (Tầng Controller)
 * Tiếp nhận và xử lý HTTP Request về Xác thực, JWT Token và Cookie HttpOnly
 */
class AuthController {
  /**
   * [POST] /api/auth/register - Đăng ký tài khoản mới
   * Trả về Access Token và lưu Refresh Token vào Cookie HttpOnly
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

      // Lưu trữ Refresh Token vào Cookie HttpOnly
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, cookieOptions);

      return sendSuccess(
        res,
        {
          user: result.user,
          accessToken: result.accessToken,
          token: result.accessToken, // Tương thích ngược
        },
        "Đăng ký tài khoản thành công! Đã gửi email chào mừng.",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * [POST] /api/auth/login - Đăng nhập tài khoản
   * Cấp cặp Access Token và Refresh Token (HttpOnly Cookie)
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });

      // Lưu trữ Refresh Token vào Cookie HttpOnly
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, cookieOptions);

      return sendSuccess(
        res,
        {
          user: result.user,
          accessToken: result.accessToken,
          token: result.accessToken, // Tương thích ngược
        },
        "Đăng nhập thành công!"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * [POST] /api/auth/refresh-token - Tái cấp Access Token mới từ Refresh Token
   */
  static async refreshToken(req, res, next) {
    try {
      // Đọc Refresh Token từ Cookie HttpOnly hoặc Request Body
      const tokenFromCookie = req.cookies?.[REFRESH_COOKIE_NAME];
      const tokenFromBody = req.body?.refreshToken;
      const refreshToken = tokenFromCookie || tokenFromBody;

      if (!refreshToken) {
        return sendError(res, "Không tìm thấy Refresh Token hợp lệ", 401);
      }

      const result = await AuthService.refreshAccessToken(refreshToken);

      // Cập nhật lại Cookie HttpOnly nếu có Refresh Token mới
      if (result.refreshToken) {
        res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, cookieOptions);
      }

      return sendSuccess(
        res,
        {
          accessToken: result.accessToken,
          token: result.accessToken,
          user: result.user,
        },
        "Tái cấp Access Token thành công!"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * [POST] /api/auth/logout - Đăng xuất tài khoản
   * Xóa Cookie HttpOnly chứa Refresh Token
   */
  static async logout(req, res, next) {
    try {
      res.clearCookie(REFRESH_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      });
      return sendSuccess(res, null, "Đăng xuất tài khoản thành công!");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/auth/profile - Lấy thông tin cá nhân hiện tại
   */
  static async getProfile(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user.user_id);
      return sendSuccess(res, user, "Lấy thông tin cá nhân thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [PUT] /api/auth/profile - Cập nhật thông tin cá nhân
   */
  static async updateProfile(req, res, next) {
    try {
      const { full_name, phone, address, avatar_url } = req.body;
      const updated = await AuthService.updateProfile(req.user.user_id, {
        full_name,
        phone,
        address,
        avatar_url,
      });
      return sendSuccess(res, updated, "Cập nhật thông tin cá nhân thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [PUT] /api/auth/change-password - Đổi mật khẩu
   */
  static async changePassword(req, res, next) {
    try {
      const { current_password, new_password } = req.body;
      await AuthService.changePassword(req.user.user_id, {
        current_password,
        new_password,
      });
      return sendSuccess(res, null, "Đổi mật khẩu thành công!");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
