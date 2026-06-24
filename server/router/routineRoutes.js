const express = require("express");
const router = express.Router();
const routineController = require("../controller/routineController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", routineController.getAllRoutines);
router.post("/", routineController.saveRoutine);
router.get("/:memberId", routineController.getRoutine);
router.delete("/:memberId", routineController.deleteRoutine);

module.exports = router;
