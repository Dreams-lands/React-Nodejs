const CategoryService = require("../services/category.service");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * CategoryController - Xử lý HTTP request cho danh mục sản phẩm
 */
class CategoryController {
  /**
   * [GET] /api/categories - Lấy tất cả danh mục
   */
  static async getCategories(req, res, next) {
    try {
      const categories = await CategoryService.getAllCategories();
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
      return sendSuccess(res, category, "Lấy thông tin danh mục thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [POST] /api/categories - Tạo danh mục mới
   */
  static async createCategory(req, res, next) {
    try {
      const { category_name, description } = req.body;
      const newCategory = await CategoryService.createCategory({
        category_name,
        description,
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
      const { category_name, description } = req.body;
      const updatedCategory = await CategoryService.updateCategory(id, {
        category_name,
        description,
      });
      return sendSuccess(res, updatedCategory, "Cập nhật danh mục thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [DELETE] /api/categories/:id - Xóa danh mục
   */
  static async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      await CategoryService.deleteCategory(id);
      return sendSuccess(
        res,
        { category_id: Number(id) },
        "Xóa danh mục thành công"
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoryController;
