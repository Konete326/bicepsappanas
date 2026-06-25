const express = require("express");
const authController = require("../controller/authController");
const router = express.Router();

const { protect, restrictTo } = require("../middleware/authMiddleware");

router.post("/signup", protect, restrictTo("admin"), authController.signup);
router.post("/login", authController.login);
router.patch("/update-profile", protect, authController.updateProfile);
router.patch("/change-password", protect, authController.changePassword);

router.get("/admins", protect, restrictTo("admin"), authController.getAdmins);
router.patch("/admins/:id", protect, restrictTo("admin"), authController.updateAdmin);
router.delete("/admins/:id", protect, restrictTo("admin"), authController.deleteAdmin);

module.exports = router;
