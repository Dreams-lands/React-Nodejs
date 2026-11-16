const CategoryModel = require("../models/category.model");

/**
 * CategoryService (Tầng Service)
 * Quản lý danh mục sản phẩm
 */
class CategoryService {
  static async getAllCategories(filters) {
    return await CategoryModel.findAll(filters);
  }

  static async getCategoryById(categoryId) {
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      const error = new Error(`Không tìm thấy danh mục với ID: ${categoryId}`);
      error.statusCode = 404;
      throw error;
    }
    return category;
  }

  static async createCategory({ category_name, description, is_active = true }) {
    if (!category_name || !category_name.trim()) {
      const error = new Error("Tên danh mục không được để trống");
      error.statusCode = 400;
      throw error;
    }

    return await CategoryModel.create({
      category_name: category_name.trim(),
      description,
      is_active,
    });
  }

  static async updateCategory(categoryId, updateData) {
    await this.getCategoryById(categoryId);
    return await CategoryModel.update(categoryId, updateData);
  }

  static async deleteCategory(categoryId) {
    await this.getCategoryById(categoryId);
    return await CategoryModel.delete(categoryId);
  }
}

module.exports = CategoryService;
