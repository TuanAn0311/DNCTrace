const cartService = require("../services/cartService");

exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const items = await cartService.getCartByUserId(userId);
        res.json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { product_id, quantity = 1 } = req.body;

        if (!product_id || Number(quantity) <= 0) {
            return res.status(400).json({ success: false, message: "Thông tin giỏ hàng không hợp lệ!" });
        }

        const cartItem = await cartService.addToCart(userId, { product_id, quantity });

        res.json({
            success: true,
            message: "Đã thêm vào giỏ hàng!",
            data: cartItem,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (!quantity || Number(quantity) <= 0) {
            return res.status(400).json({ success: false, message: "Số lượng không hợp lệ!" });
        }

        const updatedItem = await cartService.updateCartItem(id, quantity);
        if (!updatedItem) {
            return res.status(404).json({ success: false, message: "Không tìm thấy mục giỏ hàng!" });
        }

        res.json({
            success: true,
            message: "Cập nhật giỏ hàng thành công!",
            data: updatedItem,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCartItemByProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const { product_id, quantity } = req.body;

        if (!product_id || !quantity || Number(quantity) <= 0) {
            return res.status(400).json({ success: false, message: "Số lượng không hợp lệ!" });
        }

        const updatedItem = await cartService.updateCartItemByProduct(userId, product_id, quantity);
        if (!updatedItem) {
            return res.status(404).json({ success: false, message: "Không tìm thấy mục giỏ hàng!" });
        }

        res.json({
            success: true,
            message: "Cập nhật giỏ hàng thành công!",
            data: updatedItem,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedItem = await cartService.removeCartItem(id);

        if (!deletedItem) {
            return res.status(404).json({ success: false, message: "Không tìm thấy mục giỏ hàng!" });
        }

        res.json({
            success: true,
            message: "Xóa sản phẩm khỏi giỏ hàng thành công!",
            data: deletedItem,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeCartItemByProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const deletedItem = await cartService.removeCartItemByProduct(userId, productId);

        if (!deletedItem) {
            return res.status(404).json({ success: false, message: "Không tìm thấy mục giỏ hàng!" });
        }

        res.json({
            success: true,
            message: "Xóa sản phẩm khỏi giỏ hàng thành công!",
            data: deletedItem,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
