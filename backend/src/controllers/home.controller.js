const { sendSuccess } = require("../utils/response");

/**
 * HomeController
 * Xử lý các yêu cầu kiểm tra trạng thái máy chủ (Healthcheck / Welcome)
 */
class HomeController {
  static getStatus(req, res) {
    return sendSuccess(
      res,
      {
        project: "PetHub - E-Commerce & Pet Services API",
        architecture: "MVC Pattern (Model - View - Controller) with Service Layer",
        database: "PostgreSQL",
        status: "Online",
        timestamp: new Date().toISOString(),
        version: "2.0.0",
        endpoints: {
          auth: {
            register: "POST /api/auth/register",
            login: "POST /api/auth/login",
            profile: "GET /api/auth/profile",
            updateProfile: "PUT /api/auth/profile",
            changePassword: "PUT /api/auth/change-password",
          },
          products: "GET /api/products",
          categories: "GET /api/categories",
          orders: "GET, POST /api/orders",
          orderLookup: "GET /api/orders/lookup?code=...&phone=...",
          cart: "GET, POST, PUT, DELETE /api/cart",
          users: "GET, POST, PUT, DELETE /api/users",
        },
      },
      "Máy chủ PetHub Backend đang hoạt động ổn định!"
    );
  }

  static getHealth(req, res) {
    return sendSuccess(
      res,
      {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        status: "OK",
        database: "PostgreSQL connected",
      },
      "Hệ thống PetHub hoạt động ổn định"
    );
  }
}

module.exports = HomeController;
