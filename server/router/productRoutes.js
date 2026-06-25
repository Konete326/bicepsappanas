const express = require("express");
const router = express.Router();
const productController = require("../controller/productController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../middlewares/upload");

router.use(protect);

router.post("/", upload.array("images", 3), productController.createProduct);
router.get("/", productController.getProducts);
router.get("/low-stock", productController.getLowStock);
router.get("/:id", productController.getProduct);
router.put("/:id", upload.array("images", 3), productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
