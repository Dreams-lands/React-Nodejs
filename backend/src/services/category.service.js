const CategoryModel = require("../models/category.model");

/**
 * CategoryService - Logic nghiệp vụ cho danh mục sản phẩm
 */
class CategoryService {
  /**
   * Lấy tất cả danh mục
   */
  static async getAllCategories() {
    return await CategoryModel.findAll();
  }

  /**
   * Lấy danh mục theo ID
   */
  static async getCategoryById(id) {
    if (!id || isNaN(id)) {
      const error = new Error("ID danh mục không hợp lệ");
      error.statusCode = 400;
      throw error;
    }

    const category = await CategoryModel.findById(id);
    if (!category) {
      const error = new Error(`Không tìm thấy danh mục với ID: ${id}`);
      error.statusCode = 404;
      throw error;
    }

    return category;
  }

  /**
   * Tạo danh mục mới
   */
  static async createCategory({ category_name, description }) {
    if (!category_name || !category_name.trim()) {
      const error = new Error("Tên danh mục không được để trống");
      error.statusCode = 400;
      throw error;
    }

    return await CategoryModel.create({
      category_name: category_name.trim(),
      description: description ? description.trim() : null,
    });
  }

  /**
   * Cập nhật danh mục
   */
  static async updateCategory(id, data) {
    // Đảm bảo danh mục tồn tại
    await this.getCategoryById(id);

    if (data.category_name !== undefined && !data.category_name.trim()) {
      const error = new Error("Tên danh mục không được để trống");
      error.statusCode = 400;
      throw error;
    }

    return await CategoryModel.update(id, data);
  }

  /**
   * Xóa danh mục (soft delete)
   */
  static async deleteCategory(id) {
    // Đảm bảo danh mục tồn tại
    await this.getCategoryById(id);

    // Kiểm tra xem danh mục có sản phẩm đang sử dụng không
    const productCount = await CategoryModel.countProducts(id);
    if (productCount > 0) {
      const error = new Error("Không thể xóa danh mục đang chứa sản phẩm");
      error.statusCode = 400;
      throw error;
    }

    return await CategoryModel.softDelete(id);
  }
}

module.exports = CategoryService;
