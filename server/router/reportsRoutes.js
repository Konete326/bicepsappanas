const express = require("express");
const router = express.Router();
const { getReports } = require("../controller/reportsController");
const { protect, hasPermission } = require("../middleware/authMiddleware");

router.get("/", protect, hasPermission("reports"), getReports);

module.exports = router;
