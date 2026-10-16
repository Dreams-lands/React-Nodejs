const UserService = require("../services/user.service");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * UserController (Tầng Controller trong MVC)
 * Tiếp nhận HTTP Request từ Route, trích xuất dữ liệu, gọi UserService và phản hồi HTTP Response
 */
class UserController {
  /**
   * [GET] /api/users - Lấy danh sách người dùng
   */
  static async getUsers(req, res, next) {
    try {
      const users = await UserService.getAllUsers();
      return sendSuccess(res, users, "Lấy danh sách người dùng thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/users/:id - Lấy chi tiết một người dùng
   */
  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);
      return sendSuccess(res, user, "Lấy thông tin người dùng thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [POST] /api/users - Tạo người dùng mới
   */
  static async createUser(req, res, next) {
    try {
      const { name, email, role, status } = req.body;
      const newUser = await UserService.createUser({ name, email, role, status });
      return sendSuccess(res, newUser, "Tạo người dùng mới thành công", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [PUT] /api/users/:id - Cập nhật người dùng
   */
  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { name, email, role, status } = req.body;
      const updatedUser = await UserService.updateUser(id, {
        name,
        email,
        role,
        status,
      });
      return sendSuccess(res, updatedUser, "Cập nhật người dùng thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [DELETE] /api/users/:id - Xóa người dùng
   */
  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      await UserService.deleteUser(id);
      return sendSuccess(res, { id: Number(id) }, "Xóa người dùng thành công");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
