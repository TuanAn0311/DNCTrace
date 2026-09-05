const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

router.post("/checkout", verifyToken, orderController.placeOrder);
router.post("/place", verifyToken, orderController.placeOrder);
router.get("/user", verifyToken, orderController.getUserOrders);
router.get("/user/:id", verifyToken, orderController.getUserOrderDetails);
router.post("/user/:id/confirm-received", verifyToken, orderController.confirmReceivedByUser);
router.post("/:id/confirm-received", verifyToken, orderController.confirmReceivedByUser);
router.get("/admin/all", verifyAdmin, orderController.getAllOrdersAdmin);
router.get("/admin/dashboard/stats", verifyAdmin, orderController.getDashboardStats);
router.get("/admin/dashboard", verifyAdmin, orderController.getDashboardStats);
router.get("/admin", verifyAdmin, orderController.getAllOrdersAdmin);
router.get("/admin/:id", verifyAdmin, orderController.getAllOrdersDetailAdmin);
router.put("/admin/:id/status", verifyAdmin, orderController.updateOrderStatus);

module.exports = router;
