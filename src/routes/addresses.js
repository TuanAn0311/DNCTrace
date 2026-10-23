const express = require("express");
const router = express.Router();

const addressController = require("../controllers/addressController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/", verifyToken, addressController.getAddresses);
router.post("/", verifyToken, addressController.createAddress);
router.put("/:id/default", verifyToken, addressController.setDefaultAddress);
router.put("/:id", verifyToken, addressController.updateAddress);
router.delete("/:id", verifyToken, addressController.deleteAddress);

module.exports = router;
