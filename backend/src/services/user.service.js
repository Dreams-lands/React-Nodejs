const UserModel = require("../models/user.model");

/**
 * UserService (Tầng Service trong kiến trúc MVC mở rộng)
 * Chứa logic nghiệp vụ, kiểm tra ràng buộc dữ liệu trước khi gọi Model
 */
class UserService {
  /**
   * Lấy danh sách toàn bộ người dùng
   */
  static async getAllUsers() {
    return await UserModel.findAll();
  }

  /**
   * Lấy chi tiết một người dùng
   */
  static async getUserById(id) {
    if (!id || isNaN(id)) {
      const error = new Error("ID người dùng không hợp lệ");
      error.statusCode = 400;
      throw error;
    }

    const user = await UserModel.findById(id);
    if (!user) {
      const error = new Error(`Không tìm thấy người dùng với ID: ${id}`);
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  /**
   * Tạo người dùng mới
   */
  static async createUser({ name, email, role, status = "active" }) {
    if (!name || !name.trim()) {
      const error = new Error("Tên người dùng không được để trống");
      error.statusCode = 400;
      throw error;
    }

    if (!email || !email.trim()) {
      const error = new Error("Email không được để trống");
      error.statusCode = 400;
      throw error;
    }

    // Kiểm tra định dạng email cơ bản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = new Error("Định dạng email không hợp lệ");
      error.statusCode = 400;
      throw error;
    }

    // Kiểm tra email trùng lặp
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      const error = new Error("Email này đã được sử dụng");
      error.statusCode = 409;
      throw error;
    }

    return await UserModel.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role || "user",
      status: status || "active",
    });
  }

  /**
   * Cập nhật người dùng
   */
  static async updateUser(id, updateData) {
    await this.getUserById(id); // Đảm bảo user tồn tại

    if (updateData.email) {
      const existingUser = await UserModel.findByEmail(updateData.email);
      if (existingUser && existingUser.id !== Number(id)) {
        const error = new Error("Email đã được tài khoản khác sử dụng");
        error.statusCode = 409;
        throw error;
      }
    }

    return await UserModel.update(id, updateData);
  }

  /**
   * Xóa người dùng
   */
  static async deleteUser(id) {
    await this.getUserById(id); // Đảm bảo user tồn tại
    return await UserModel.delete(id);
  }
}

module.exports = UserService;
