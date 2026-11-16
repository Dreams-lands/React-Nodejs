const express = require("express");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const categoryRoutes = require("./category.routes");
const productRoutes = require("./product.routes");
const orderRoutes = require("./order.routes");
const dashboardRoutes = require("./dashboard.routes");
const HomeController = require("../controllers/home.controller");

const router = express.Router();

// Root API Endpoint
router.get("/", HomeController.getStatus);

// Healthcheck Endpoint
router.get("/health", HomeController.getHealth);

// Module Routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/dashboard", dashboardRoutes);

module.exports = router;
