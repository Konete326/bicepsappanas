const express = require("express");
const router = express.Router();
const memberController = require("../controller/memberController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", memberController.createMember);
router.get("/", memberController.getMembers);
router.get("/payment-grid/:memberId", memberController.getPaymentGrid);
router.get("/:id", memberController.getMember);
router.put("/:id", memberController.updateMember);
router.delete("/:id", memberController.deleteMember);

module.exports = router;
