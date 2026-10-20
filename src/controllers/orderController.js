const orderService = require("../services/orderService");

// =================== USER ====================
exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await orderService.getUserOrders(userId);
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy chi tiết đơn hàng của người dùng
exports.getUserOrderDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const details = await orderService.getUserOrderDetails(userId, id);
        if (!details) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng!" });
        }

        res.json({ success: true, data: details });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Đặt hàng
exports.placeOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { address_id, payment_method = "COD" } = req.body;

        if (!address_id) {
            return res.status(400).json({ success: false, message: "Vui long chon dia chi giao hang!" });
        }

        if (!["COD", "QR"].includes(payment_method)) {
            return res.status(400).json({ success: false, message: "Phuong thuc thanh toan khong hop le!" });
        }

        const { orderId, emailSent, order } = await orderService.placeOrder(userId, { address_id, payment_method });

        res.json({
            success: true,
            message: "Dat hang thanh cong!",
            order_id: orderId,
            email_sent: emailSent,
            data: order,
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// Xác nhận đã nhận hàng bởi người dùng
exports.confirmReceivedByUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const updatedOrder = await orderService.confirmReceivedByUser(userId, id);

        res.json({
            success: true,
            message: "Xac nhan da nhan hang thanh cong!",
            data: updatedOrder,
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

//==================== ADMIN ====================
// Lấy tất cả đơn hàng cho admin
exports.getAllOrdersAdmin = async (req, res) => {
    try {
        const orders = await orderService.getAllOrdersAdmin();
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy chi tiết đơn hàng cho admin
exports.getAllOrdersDetailAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const details = await orderService.getAllOrdersDetailAdmin(id);
        res.json({ success: true, data: details });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cập nhật trạng thái đơn hàng cho admin
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Trang thai don hang khong hop le!" });
        }

        const updatedOrder = await orderService.updateOrderStatus(id, status);
        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Khong tim thay don hang!" });
        }

        res.json({
            success: true,
            message: "Trang thai don hang da duoc cap nhat!",
            data: updatedOrder,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//==================== DASHBOARD ====================
exports.getDashboardStats = async (req, res) => {
    try {
        const stats = await orderService.getDashboardStats();
        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
