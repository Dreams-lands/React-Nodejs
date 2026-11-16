const express = require("express");
const CartController = require("../controllers/cart.controller");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();

/**
 * Định tuyến Giỏ hàng (Carts & Cart_Items) - Yêu cầu đăng nhập
 */
router.use(authenticate);

router.get("/", CartController.getCart);
router.post("/items", CartController.addToCart);
router.put("/items/:id", CartController.updateCartItem);
router.delete("/items/:id", CartController.removeCartItem);
router.delete("/", CartController.clearCart);

module.exports = router;
