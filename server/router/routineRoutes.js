const express = require("express");
const router = express.Router();
const routineController = require("../controller/routineController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", routineController.saveRoutine);
router.get("/:memberId", routineController.getRoutine);

module.exports = router;
