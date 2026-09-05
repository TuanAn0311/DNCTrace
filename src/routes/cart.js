const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cartController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/", verifyToken, cartController.getCart);
router.post("/", verifyToken, cartController.addToCart);
router.post("/add", verifyToken, cartController.addToCart);
router.put("/update", verifyToken, cartController.updateCartItemByProduct);
router.put("/:id", verifyToken, cartController.updateCartItem);
router.delete("/remove/:productId", verifyToken, cartController.removeCartItemByProduct);
router.delete("/:id", verifyToken, cartController.removeCartItem);

module.exports = router;
