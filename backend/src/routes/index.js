const express = require("express");
const userRoutes = require("./user.routes");
const HomeController = require("../controllers/home.controller");

const router = express.Router();

// Root API Endpoint
router.get("/", HomeController.getStatus);

// Healthcheck Endpoint
router.get("/health", HomeController.getHealth);

// Module Routes
router.use("/users", userRoutes);

module.exports = router;
