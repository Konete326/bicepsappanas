const express = require("express");
const router = express.Router();
const trainerController = require("../controller/trainerController");
const ledgerController = require("../controller/ledgerController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.use(protect);
router.use(restrictTo("admin"));

router.post("/ledger", ledgerController.createLedgerEntry);
router.get("/ledger/:trainerId", ledgerController.getLedger);
router.delete("/ledger/:id", ledgerController.deleteLedgerEntry);

router.post("/", trainerController.createTrainer);
router.get("/salary-status", trainerController.getSalaryStatusAll);
router.get("/", trainerController.getTrainers);
router.get("/:id", trainerController.getTrainer);
router.put("/:id", trainerController.updateTrainer);
router.delete("/:id", trainerController.deleteTrainer);

module.exports = router;
