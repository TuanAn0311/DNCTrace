const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const { verifyAdmin } = require("../middlewares/authMiddleware");

router.get("/", productController.getAllProducts);
router.post("/", verifyAdmin, productController.createProduct);
router.get("/:id", productController.getProductById);
router.put("/update/:id", verifyAdmin, productController.updateProduct);
router.delete("/:id", verifyAdmin, productController.deleteProduct);
router.put("/activate/:id", verifyAdmin, productController.activateProduct);

module.exports = router;
