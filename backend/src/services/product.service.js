const ProductModel = require("../models/product.model");
const CategoryModel = require("../models/category.model");

/**
 * ProductService - Logic nghiệp vụ cho sản phẩm
 */
class ProductService {
  /**
   * Lấy danh sách sản phẩm (phân trang, tìm kiếm, lọc)
   */
  static async getAllProducts(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const search = query.search || undefined;
    const category_id = query.category_id
      ? parseInt(query.category_id, 10)
      : undefined;
    const status = query.status || undefined;

    return await ProductModel.findAll({ page, limit, search, category_id, status });
  }

  /**
   * Lấy sản phẩm theo ID
   */
  static async getProductById(id) {
    if (!id || isNaN(id)) {
      const error = new Error("ID sản phẩm không hợp lệ");
      error.statusCode = 400;
      throw error;
    }

    const product = await ProductModel.findById(id);
    if (!product) {
      const error = new Error(`Không tìm thấy sản phẩm với ID: ${id}`);
      error.statusCode = 404;
      throw error;
    }

    return product;
  }

  /**
   * Validate dữ liệu sản phẩm
   */
  static _validateProductData(data, isUpdate = false) {
    if (!isUpdate) {
      if (!data.product_name || !data.product_name.trim()) {
        const error = new Error("Tên sản phẩm không được để trống");
        error.statusCode = 400;
        throw error;
      }
      if (!data.sku || !data.sku.trim()) {
        const error = new Error("Mã SKU không được để trống");
        error.statusCode = 400;
        throw error;
      }
      if (!data.category_id) {
        const error = new Error("Danh mục sản phẩm là bắt buộc");
        error.statusCode = 400;
        throw error;
      }
      if (data.price === undefined || data.price === null) {
        const error = new Error("Giá sản phẩm là bắt buộc");
        error.statusCode = 400;
        throw error;
      }
    }

    if (data.price !== undefined) {
      const price = parseFloat(data.price);
      if (isNaN(price) || price <= 0) {
        const error = new Error("Giá sản phẩm phải lớn hơn 0");
        error.statusCode = 400;
        throw error;
      }
    }

    if (data.stock_quantity !== undefined) {
      const stock = parseInt(data.stock_quantity, 10);
      if (isNaN(stock) || stock < 0) {
        const error = new Error("Số lượng tồn kho phải >= 0");
        error.statusCode = 400;
        throw error;
      }
    }

    if (data.product_name !== undefined && !data.product_name.trim()) {
      const error = new Error("Tên sản phẩm không được để trống");
      error.statusCode = 400;
      throw error;
    }
  }

  /**
   * Tạo sản phẩm mới
   */
  static async createProduct(data) {
    this._validateProductData(data, false);

    // Kiểm tra danh mục tồn tại
    const category = await CategoryModel.findById(data.category_id);
    if (!category) {
      const error = new Error("Danh mục sản phẩm không tồn tại");
      error.statusCode = 400;
      throw error;
    }

    return await ProductModel.create({
      category_id: data.category_id,
      sku: data.sku.trim(),
      product_name: data.product_name.trim(),
      description: data.description ? data.description.trim() : null,
      price: parseFloat(data.price),
      stock_quantity: parseInt(data.stock_quantity, 10) || 0,
    });
  }

  /**
   * Cập nhật sản phẩm
   */
  static async updateProduct(id, data) {
    // Đảm bảo sản phẩm tồn tại
    await this.getProductById(id);

    this._validateProductData(data, true);

    // Nếu đổi danh mục, kiểm tra danh mục mới có tồn tại không
    if (data.category_id) {
      const category = await CategoryModel.findById(data.category_id);
      if (!category) {
        const error = new Error("Danh mục sản phẩm không tồn tại");
        error.statusCode = 400;
        throw error;
      }
    }

    return await ProductModel.update(id, data);
  }

  /**
   * Xóa sản phẩm (soft delete)
   */
  static async deleteProduct(id) {
    await this.getProductById(id);
    return await ProductModel.softDelete(id);
  }

  /**
   * Lấy sản phẩm tồn kho thấp (<= 15)
   */
  static async getLowStockProducts() {
    return await ProductModel.findLowStock(15);
  }
}

module.exports = ProductService;
