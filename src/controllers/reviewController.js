const reviewService = require("../services/reviewService");

exports.getReviews = async (req, res) => {
    try {
        const reviews = await reviewService.getReviews();
        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getReviewsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await reviewService.getReviewsByProduct(productId);
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

        const newReview = await reviewService.createReview(userId, { product_id, rating, comment });
        res.json({
            success: true,
            message: "Đánh giá đã được gửi!",
            data: newReview,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { rating, comment } = req.body;

        const updatedReview = await reviewService.updateReview(id, userId, { rating, comment });
        if (!updatedReview) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá!" });
        }

        res.json({
            success: true,
            message: "Cập nhật đánh giá thành công!",
            data: updatedReview,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const deletedReview = await reviewService.deleteReview(id, userId);

        if (!deletedReview) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá!" });
        }

        res.json({
            success: true,
            message: "Xóa đánh giá thành công!",
            data: deletedReview,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
