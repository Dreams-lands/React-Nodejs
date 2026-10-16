const express = require("express");
const cors = require("cors");
const corsOptions = require("./config/cors");
const routes = require("./routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// ========================
// Global Middlewares
// ========================
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================
// API Routes
// ========================
// Tiền tố /api cho tất cả endpoints
app.use("/api", routes);

// Route mặc định cho root
app.get("/", (req, res) => {
  res.redirect("/api");
});

// ========================
// Error Handling Middlewares
// ========================
app.use(notFound);
app.use(errorHandler);

module.exports = app;
