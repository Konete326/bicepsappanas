const express = require("express");
const router = express.Router();
const saleController = require("../controller/saleController");
const { protect, hasPermission } = require("../middleware/authMiddleware");

router.use(protect, hasPermission("pos"));

router.post("/", saleController.createSale);
router.get("/", saleController.getSales);
router.get("/:id", saleController.getSale);

module.exports = router;
