const express = require("express");
const router = express.Router();
const { getReports } = require("../controller/reportsController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.get("/", protect, restrictTo("admin"), getReports);

module.exports = router;
