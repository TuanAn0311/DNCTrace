const db = require("../config/db");

exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const [items] = await db.execute(
            `SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.image, p.stock
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
            [userId],
        );
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

        const [existing] = await db.execute("SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?", [userId, product_id]);

        if (existing.length > 0) {
            const newQty = Number(existing[0].quantity) + Number(quantity);
            await db.execute("UPDATE cart SET quantity = ? WHERE id = ?", [newQty, existing[0].id]);
        } else {
            await db.execute("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)", [userId, product_id, quantity]);
        }

        res.json({ success: true, message: "Đã thêm vào giỏ hàng!" });
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

        const [result] = await db.execute("UPDATE cart SET quantity = ? WHERE id = ?", [quantity, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy mục giỏ hàng!" });
        }

        res.json({ success: true, message: "Cập nhật giỏ hàng thành công!" });
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

        const [result] = await db.execute("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?", [quantity, userId, product_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy mục giỏ hàng!" });
        }

        res.json({ success: true, message: "Cập nhật giỏ hàng thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.execute("DELETE FROM cart WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy mục giỏ hàng!" });
        }

        res.json({ success: true, message: "Xóa sản phẩm khỏi giỏ hàng thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeCartItemByProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const [result] = await db.execute("DELETE FROM cart WHERE user_id = ? AND product_id = ?", [userId, productId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy mục giỏ hàng!" });
        }

        res.json({ success: true, message: "Xóa sản phẩm khỏi giỏ hàng thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
