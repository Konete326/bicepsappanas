const express = require("express");
const router = express.Router();
const paymentController = require("../controller/paymentController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", paymentController.createPayment);
router.get("/", paymentController.getPayments);
router.get("/dues", paymentController.getOutstandingDues);
router.get("/member/:memberId", paymentController.getMemberPayments);
router.get("/:id", paymentController.getPayment);

module.exports = router;
