const express = require("express");
const UserController = require("../controllers/user.controller");
const { authenticate, requireRole } = require("../middlewares/auth");

const router = express.Router();

/**
 * Định tuyến Quản lý người dùng
 */
// Lấy danh sách quyền (Public hoặc Authenticated)
router.get("/roles", UserController.getRoles);

// CRUD người dùng (Yêu cầu quyền Admin, Manager hoặc Staff)
router.get("/", authenticate, requireRole("Admin", "Manager", "Staff"), UserController.getUsers);
router.get("/:id", authenticate, requireRole("Admin", "Manager", "Staff"), UserController.getUserById);
router.post("/", authenticate, requireRole("Admin"), UserController.createUser);
router.put("/:id", authenticate, requireRole("Admin"), UserController.updateUser);
router.delete("/:id", authenticate, requireRole("Admin"), UserController.deleteUser);

module.exports = router;
