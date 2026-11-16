const ProductService = require("../services/product.service");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * ProductController - Xử lý HTTP request cho sản phẩm
 */
class ProductController {
  /**
   * [GET] /api/products - Lấy danh sách sản phẩm (phân trang + tìm kiếm)
   */
  static async getProducts(req, res, next) {
    try {
      const result = await ProductService.getAllProducts(req.query);
      return sendSuccess(res, result, "Lấy danh sách sản phẩm thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/products/low-stock - Lấy sản phẩm tồn kho thấp
   */
  static async getLowStock(req, res, next) {
    try {
      const products = await ProductService.getLowStockProducts();
      return sendSuccess(
        res,
        products,
        "Lấy danh sách sản phẩm tồn kho thấp thành công"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/products/:id - Lấy chi tiết sản phẩm
   */
  static async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);
      return sendSuccess(res, product, "Lấy thông tin sản phẩm thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [POST] /api/products - Tạo sản phẩm mới
   */
  static async createProduct(req, res, next) {
    try {
      const newProduct = await ProductService.createProduct(req.body);
      return sendSuccess(res, newProduct, "Tạo sản phẩm mới thành công", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [PUT] /api/products/:id - Cập nhật sản phẩm
   */
  static async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const updatedProduct = await ProductService.updateProduct(id, req.body);
      return sendSuccess(
        res,
        updatedProduct,
        "Cập nhật sản phẩm thành công"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * [DELETE] /api/products/:id - Xóa sản phẩm
   */
  static async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      await ProductService.deleteProduct(id);
      return sendSuccess(
        res,
        { product_id: Number(id) },
        "Xóa sản phẩm thành công"
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;
