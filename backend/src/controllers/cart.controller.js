const CartService = require("../services/cart.service");
const { sendSuccess } = require("../utils/response");

/**
 * CartController (Tầng Controller)
 * Quản lý giỏ hàng cho tài khoản đã đăng nhập
 */
class CartController {
  /**
   * [GET] /api/cart - Lấy danh sách sản phẩm trong giỏ hàng
   */
  static async getCart(req, res, next) {
    try {
      const cart = await CartService.getCart(req.user.user_id);
      return sendSuccess(res, cart, "Lấy thông tin giỏ hàng thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [POST] /api/cart/items - Thêm sản phẩm vào giỏ hàng
   */
  static async addToCart(req, res, next) {
    try {
      const { product_id, quantity } = req.body;
      const cart = await CartService.addToCart(req.user.user_id, {
        product_id,
        quantity,
      });
      return sendSuccess(res, cart, "Đã thêm sản phẩm vào giỏ hàng", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [PUT] /api/cart/items/:id - Thay đổi số lượng sản phẩm trong giỏ hàng
   */
  static async updateCartItem(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const cart = await CartService.updateCartItem(req.user.user_id, id, quantity);
      return sendSuccess(res, cart, "Cập nhật giỏ hàng thành công");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [DELETE] /api/cart/items/:id - Xóa 1 sản phẩm khỏi giỏ hàng
   */
  static async removeCartItem(req, res, next) {
    try {
      const { id } = req.params;
      const cart = await CartService.removeCartItem(req.user.user_id, id);
      return sendSuccess(res, cart, "Đã xóa sản phẩm khỏi giỏ hàng");
    } catch (error) {
      next(error);
    }
  }

  /**
   * [DELETE] /api/cart - Làm trống giỏ hàng
   */
  static async clearCart(req, res, next) {
    try {
      const result = await CartService.clearCart(req.user.user_id);
      return sendSuccess(res, result, "Đã làm trống giỏ hàng");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CartController;
