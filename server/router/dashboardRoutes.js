const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controller/dashboardController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.get("/", protect, restrictTo("admin"), getDashboardStats);

module.exports = router;
