const CategoryService = require("../services/category.service");
const { sendSuccess } = require("../utils/response");

/**
 * CategoryController (Tầng Controller)
 * Quản lý danh mục sản phẩm
 */
class CategoryController {
  /**
   * [GET] /api/categories - Lấy danh sách danh mục
   */
  static async getCategories(req, res, next) {
    try {
      const { is_active } = req.query;
      const categories = await CategoryService.getAllCategories({
        is_active: is_active !== undefined ? is_active === "true" : undefined,
      });
      return sendSuccess(res, categories, "Lấy danh sách danh mục thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/categories/:id - Lấy chi tiết danh mục
   */
  static async getCategoryById(req, res, next) {
    try {
      const { id } = req.params;
      const category = await CategoryService.getCategoryById(id);
      return sendSuccess(res, category, "Lấy chi tiết danh mục thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [POST] /api/categories - Tạo danh mục mới
   */
  static async createCategory(req, res, next) {
    try {
      const { category_name, description, is_active } = req.body;
      const newCategory = await CategoryService.createCategory({
        category_name,
        description,
        is_active,
      });
      return sendSuccess(res, newCategory, "Tạo danh mục mới thành công", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [PUT] /api/categories/:id - Cập nhật danh mục
   */
  static async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const { category_name, description, is_active } = req.body;
      const updated = await CategoryService.updateCategory(id, {
        category_name,
        description,
        is_active,
      });
      return sendSuccess(res, updated, "Cập nhật danh mục thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [DELETE] /api/categories/:id - Khóa / Xóa mềm danh mục
   */
  static async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      await CategoryService.deleteCategory(id);
      return sendSuccess(res, { id: Number(id) }, "Khóa danh mục thành công");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoryController;
