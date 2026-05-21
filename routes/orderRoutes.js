const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

router.post('/checkout', verifyToken, orderController.placeOrder);
router.put('/user/confirm-received/:id', verifyToken, orderController.confirmReceivedByUser);

router.get('/admin/all', verifyAdmin, orderController.getAllOrdersAdmin);
router.get('/admin/dashboard/stats', verifyAdmin, orderController.getDashboardStats);
router.get('/admin/:id', verifyAdmin, orderController.getAllOrdersDetailAdmin);
router.put('/admin/:id/status', verifyAdmin, orderController.updateOrderStatus);

module.exports = router;
