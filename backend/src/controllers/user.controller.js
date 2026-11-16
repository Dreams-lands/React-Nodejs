const UserService = require("../services/user.service");
const { sendSuccess } = require("../utils/response");

/**
 * UserController (Tầng Controller)
 * Quản trị người dùng cho Admin/Staff
 */
class UserController {
  /**
   * [GET] /api/users - Lấy danh sách người dùng
   */
  static async getUsers(req, res, next) {
    try {
      const { role_id, search, is_active } = req.query;
      const users = await UserService.getAllUsers({
        role_id: role_id ? Number(role_id) : undefined,
        search,
        is_active: is_active !== undefined ? is_active === "true" : undefined,
      });
      return sendSuccess(res, users, "Lấy danh sách người dùng thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/users/roles - Lấy danh sách quyền trong hệ thống
   */
  static async getRoles(req, res, next) {
    try {
      const roles = await UserService.getRoles();
      return sendSuccess(res, roles, "Lấy danh sách quyền thành công");
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
   * [POST] /api/users - Tạo người dùng mới (Dành cho Admin)
   */
  static async createUser(req, res, next) {
    try {
      const { role_id, full_name, email, password, phone, address, avatar_url } = req.body;
      const newUser = await UserService.createUser({
        role_id,
        full_name,
        email,
        password,
        phone,
        address,
        avatar_url,
      });
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
      const { role_id, full_name, email, phone, address, avatar_url, is_active } = req.body;
      const updatedUser = await UserService.updateUser(id, {
        role_id,
        full_name,
        email,
        phone,
        address,
        avatar_url,
        is_active,
      });
      return sendSuccess(res, updatedUser, "Cập nhật người dùng thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [DELETE] /api/users/:id - Khóa người dùng
   */
  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      await UserService.deleteUser(id);
      return sendSuccess(res, { id: Number(id) }, "Khóa tài khoản người dùng thành công");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
