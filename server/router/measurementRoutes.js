const express = require("express");
const router = express.Router();
const measurementController = require("../controller/measurementController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", measurementController.createMeasurement);
router.get("/:memberId", measurementController.getMeasurementHistory);
router.get("/:memberId/latest", measurementController.getLatestMeasurement);

module.exports = router;
