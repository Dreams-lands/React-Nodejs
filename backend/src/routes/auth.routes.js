const express = require("express");
const AuthController = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();

/**
 * Định tuyến Xác thực (Auth) - PetHub API
 */
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/logout", AuthController.logout);

// Các endpoint yêu cầu xác thực JWT qua middleware authenticate
router.get("/profile", authenticate, AuthController.getProfile);
router.put("/profile", authenticate, AuthController.updateProfile);
router.put("/change-password", authenticate, AuthController.changePassword);

module.exports = router;
