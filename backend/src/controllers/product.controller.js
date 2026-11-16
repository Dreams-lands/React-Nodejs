const ProductService = require("../services/product.service");
const { sendSuccess } = require("../utils/response");

/**
 * ProductController (Tầng Controller)
 * Quản lý danh sách, tìm kiếm, chi tiết và CRUD sản phẩm
 */
class ProductController {
  /**
   * [GET] /api/products - Lấy danh sách sản phẩm (có lọc theo danh mục, giá, từ khóa)
   */
  static async getProducts(req, res, next) {
    try {
      const {
        category_id,
        search,
        min_price,
        max_price,
        is_active,
        sort,
        limit,
        offset,
      } = req.query;

      const products = await ProductService.getAllProducts({
        category_id: category_id ? Number(category_id) : undefined,
        search,
        min_price: min_price !== undefined ? Number(min_price) : undefined,
        max_price: max_price !== undefined ? Number(max_price) : undefined,
        is_active: is_active !== undefined ? is_active === "true" : undefined,
        sort,
        limit: limit ? Number(limit) : 50,
        offset: offset ? Number(offset) : 0,
      });

      return sendSuccess(res, products, "Lấy danh sách sản phẩm thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET] /api/products/:id - Lấy chi tiết sản phẩm theo ID kèm gallery ảnh
   */
  static async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);
      return sendSuccess(res, product, "Lấy chi tiết sản phẩm thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [POST] /api/products - Tạo sản phẩm mới
   */
  static async createProduct(req, res, next) {
    try {
      const {
        category_id,
        sku,
        product_name,
        description,
        price,
        stock_quantity,
        images,
      } = req.body;

      const newProduct = await ProductService.createProduct({
        category_id,
        sku,
        product_name,
        description,
        price,
        stock_quantity,
        images,
      });

      return sendSuccess(res, newProduct, "Tạo sản phẩm mới thành công", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [PUT] /api/products/:id - Cập nhật thông tin sản phẩm
   */
  static async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updated = await ProductService.updateProduct(id, updateData);
      return sendSuccess(res, updated, "Cập nhật sản phẩm thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [DELETE] /api/products/:id - Xóa mềm sản phẩm
   */
  static async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      await ProductService.deleteProduct(id);
      return sendSuccess(res, { id: Number(id) }, "Ẩn sản phẩm thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [POST] /api/products/:id/images - Thêm ảnh cho sản phẩm
   */
  static async addImage(req, res, next) {
    try {
      const { id } = req.params;
      const { image_url, is_primary } = req.body;
      const newImage = await ProductService.addProductImage(id, image_url, is_primary);
      return sendSuccess(res, newImage, "Thêm ảnh sản phẩm thành công", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [DELETE] /api/products/images/:imageId - Xóa ảnh sản phẩm
   */
  static async deleteImage(req, res, next) {
    try {
      const { imageId } = req.params;
      await ProductService.deleteProductImage(imageId);
      return sendSuccess(res, { image_id: Number(imageId) }, "Xóa ảnh thành công");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;
