const db = require("../config/db");

exports.getReviews = async (req, res) => {
    try {
        const [reviews] = await db.execute("SELECT * FROM reviews ORDER BY created_at DESC");
        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getReviewsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const [reviews] = await db.execute("SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC", [productId]);
        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { product_id, rating, comment } = req.body;

        if (!product_id || !rating || !comment) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin đánh giá!" });
        }

        await db.execute("INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)", [userId, product_id, rating, comment]);
        res.json({ success: true, message: "Đánh giá đã được gửi!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { rating, comment } = req.body;

        const [result] = await db.execute("UPDATE reviews SET rating = ?, comment = ? WHERE id = ? AND user_id = ?", [rating, comment, id, userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá!" });
        }

        res.json({ success: true, message: "Cập nhật đánh giá thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const [result] = await db.execute("DELETE FROM reviews WHERE id = ? AND user_id = ?", [id, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá!" });
        }

        res.json({ success: true, message: "Xóa đánh giá thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
