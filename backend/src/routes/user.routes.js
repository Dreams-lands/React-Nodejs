const express = require("express");
const UserController = require("../controllers/user.controller");

const router = express.Router();

/**
 * Định tuyến tài nguyên User
 * [GET]    /api/users      - Lấy danh sách người dùng
 * [GET]    /api/users/:id  - Lấy thông tin một người dùng theo ID
 * [POST]   /api/users      - Tạo người dùng mới
 * [PUT]    /api/users/:id  - Cập nhật thông tin người dùng
 * [DELETE] /api/users/:id  - Xóa người dùng
 */
router.get("/", UserController.getUsers);
router.get("/:id", UserController.getUserById);
router.post("/", UserController.createUser);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

module.exports = router;
