const ProductModel = require("../models/product.model");
const CategoryModel = require("../models/category.model");

/**
 * ProductService (Tầng Service)
 * Quản lý sản phẩm, tồn kho và gallery ảnh
 */
class ProductService {
  static async getAllProducts(filters) {
    return await ProductModel.findAll(filters);
  }

  static async getProductById(productId) {
    const product = await ProductModel.findById(productId);
    if (!product) {
      const error = new Error(`Không tìm thấy sản phẩm với ID: ${productId}`);
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  static async createProduct({
    category_id,
    sku,
    product_name,
    description,
    price,
    stock_quantity,
    images = [],
  }) {
    if (!product_name || !product_name.trim()) {
      const error = new Error("Tên sản phẩm không được để trống");
      error.statusCode = 400;
      throw error;
    }

    if (price === undefined || isNaN(price) || Number(price) < 0) {
      const error = new Error("Giá sản phẩm không hợp lệ");
      error.statusCode = 400;
      throw error;
    }

    if (!category_id) {
      const error = new Error("Vui lòng chọn danh mục cho sản phẩm");
      error.statusCode = 400;
      throw error;
    }

    // Kiểm tra danh mục có tồn tại
    const category = await CategoryModel.findById(category_id);
    if (!category) {
      const error = new Error("Danh mục được chọn không tồn tại");
      error.statusCode = 404;
      throw error;
    }

    // Kiểm tra SKU nếu có nhập
    if (sku) {
      const existingSku = await ProductModel.findBySku(sku);
      if (existingSku) {
        const error = new Error("Mã SKU sản phẩm đã tồn tại");
        error.statusCode = 409;
        throw error;
      }
    }

    return await ProductModel.create({
      category_id: Number(category_id),
      sku: sku ? sku.trim().toUpperCase() : null,
      product_name: product_name.trim(),
      description,
      price: Number(price),
      stock_quantity: Number(stock_quantity) || 0,
      images,
    });
  }

  static async updateProduct(productId, updateData) {
    await this.getProductById(productId);

    if (updateData.sku) {
      const existingSku = await ProductModel.findBySku(updateData.sku);
      if (existingSku && existingSku.product_id !== Number(productId)) {
        const error = new Error("Mã SKU này đã thuộc về sản phẩm khác");
        error.statusCode = 409;
        throw error;
      }
    }

    return await ProductModel.update(productId, updateData);
  }

  static async deleteProduct(productId) {
    await this.getProductById(productId);
    return await ProductModel.delete(productId);
  }

  static async addProductImage(productId, imageUrl, isPrimary) {
    await this.getProductById(productId);
    return await ProductModel.addImage(productId, imageUrl, isPrimary);
  }

  static async deleteProductImage(imageId) {
    return await ProductModel.deleteImage(imageId);
  }
}

module.exports = ProductService;
