const express = require("express");
const router = express.Router();
const trainerController = require("../controller/trainerController");
const ledgerController = require("../controller/ledgerController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", trainerController.createTrainer);
router.get("/", trainerController.getTrainers);
router.get("/:id", trainerController.getTrainer);
router.put("/:id", trainerController.updateTrainer);
router.delete("/:id", trainerController.deleteTrainer);

router.post("/ledger", ledgerController.createLedgerEntry);
router.get("/ledger/:trainerId", ledgerController.getLedger);

module.exports = router;
