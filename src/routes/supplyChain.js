const express = require("express");
const router = express.Router();

const supplyChainController = require("../controllers/supplyChainController");
const { verifyAdmin } = require("../middlewares/authMiddleware");

router.post("/stage", verifyAdmin, supplyChainController.addStage);
router.post("/add-stage", verifyAdmin, supplyChainController.addStage);
router.get("/generate-hash/:productId", supplyChainController.generateHash);
router.get("/hash/:productId", supplyChainController.generateHash);
router.post("/record", verifyAdmin, supplyChainController.saveBlockchainRecord);
router.post("/save-record", verifyAdmin, supplyChainController.saveBlockchainRecord);
router.get("/records/:productId", supplyChainController.getBlockchainRecord);
router.get("/record/:productId", supplyChainController.getBlockchainRecord);
router.get("/history/:productId", supplyChainController.getHistory);

module.exports = router;
