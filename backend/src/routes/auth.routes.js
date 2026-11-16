const express = require("express");
const AuthController = require("../controllers/auth.controller");
const { verifyToken } = require("../middlewares/auth");

const router = express.Router();

// POST /api/auth/login - Đăng nhập
router.post("/login", AuthController.login);

// POST /api/auth/register - Đăng ký
router.post("/register", AuthController.register);

// GET /api/auth/me - Lấy thông tin cá nhân (cần đăng nhập)
router.get("/me", verifyToken, AuthController.getProfile);

module.exports = router;
