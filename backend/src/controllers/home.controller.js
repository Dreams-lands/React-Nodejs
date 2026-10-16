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
        project: "WebQL Fullstack Application",
        architecture: "MVC Pattern (Model - View - Controller)",
        status: "Online",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        docs: {
          users: "/api/users",
          health: "/api/health",
        },
      },
      "Máy chủ Backend WebQL đang hoạt động bình thường!",
    );
  }

  static getHealth(req, res) {
    return sendSuccess(
      res,
      {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        status: "OK",
      },
      "Hệ thống hoạt động ổn định",
    );
  }
}

module.exports = HomeController;
