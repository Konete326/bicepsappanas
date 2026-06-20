const express = require("express");
const router = express.Router();
const planController = require("../controller/planController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", planController.createPlan);
router.get("/", planController.getPlans);
router.get("/:id", planController.getPlan);
router.put("/:id", planController.updatePlan);
router.delete("/:id", planController.deletePlan);

module.exports = router;
