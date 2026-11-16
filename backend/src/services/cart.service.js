const CartModel = require("../models/cart.model");
const ProductModel = require("../models/product.model");

/**
 * CartService (Tầng Service)
 * Quản lý giỏ hàng cho tài khoản đã đăng nhập
 */
class CartService {
  static async getCart(userId) {
    return await CartModel.getCartItems(userId);
  }

  static async addToCart(userId, { product_id, quantity = 1 }) {
    if (!product_id) {
      const error = new Error("Mã sản phẩm không được để trống");
      error.statusCode = 400;
      throw error;
    }

    const product = await ProductModel.findById(product_id);
    if (!product || !product.is_active) {
      const error = new Error("Sản phẩm không tồn tại hoặc đã ngừng kinh doanh");
      error.statusCode = 404;
      throw error;
    }

    const qty = Math.max(1, Number(quantity) || 1);
    await CartModel.addItem(userId, product_id, qty);
    return await CartModel.getCartItems(userId);
  }

  static async updateCartItem(userId, cartItemId, quantity) {
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      await CartModel.removeItem(cartItemId);
    } else {
      await CartModel.updateQuantity(cartItemId, qty);
    }
    return await CartModel.getCartItems(userId);
  }

  static async removeCartItem(userId, cartItemId) {
    await CartModel.removeItem(cartItemId);
    return await CartModel.getCartItems(userId);
  }

  static async clearCart(userId) {
    await CartModel.clearCart(userId);
    return { success: true, message: "Đã làm trống giỏ hàng" };
  }
}

module.exports = CartService;
