const UserModel = require("../models/user.model");
const { hashPassword } = require("../utils/password");

/**
 * UserService (Tầng Service)
 * Quản lý danh sách người dùng cho Quản trị viên (Admin/Staff)
 */
class UserService {
  static async getAllUsers(filters) {
    return await UserModel.findAll(filters);
  }

  static async getUserById(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      const error = new Error(`Không tìm thấy người dùng với ID: ${userId}`);
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  static async createUser({ role_id = 3, full_name, email, password = "password123", phone, address, avatar_url }) {
    if (!full_name || !full_name.trim()) {
      const error = new Error("Họ và tên không được để trống");
      error.statusCode = 400;
      throw error;
    }

    if (!email || !email.trim()) {
      const error = new Error("Email không được để trống");
      error.statusCode = 400;
      throw error;
    }

    const existing = await UserModel.findByEmail(email);
    if (existing) {
      const error = new Error("Email này đã được sử dụng");
      error.statusCode = 409;
      throw error;
    }

    const password_hash = await hashPassword(password);

    return await UserModel.create({
      role_id: Number(role_id) || 3,
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      password_hash,
      phone,
      address,
      avatar_url,
    });
  }

  static async updateUser(userId, updateData) {
    await this.getUserById(userId);

    if (updateData.email) {
      const existing = await UserModel.findByEmail(updateData.email);
      if (existing && existing.user_id !== Number(userId)) {
        const error = new Error("Email đã được tài khoản khác sử dụng");
        error.statusCode = 409;
        throw error;
      }
    }

    return await UserModel.update(userId, updateData);
  }

  static async deleteUser(userId) {
    await this.getUserById(userId);
    return await UserModel.delete(userId);
  }

  static async getRoles() {
    return await UserModel.getRoles();
  }
}

module.exports = UserService;
