const db = require("../config/db");

exports.getReviews = async () => {
    const [reviews] = await db.execute(
        `SELECT r.*, u.full_name, u.avatar
         FROM reviews r
         LEFT JOIN users u ON r.user_id = u.id
         ORDER BY r.created_at DESC`
    );
    return reviews;
};

exports.getReviewsByProduct = async (productId) => {
    const [reviews] = await db.execute(
        `SELECT r.*, u.full_name, u.avatar
         FROM reviews r
         LEFT JOIN users u ON r.user_id = u.id
         WHERE r.product_id = ?
         ORDER BY r.created_at DESC`,
        [productId]
    );
    return reviews;
};

exports.createReview = async (userId, { product_id, rating, comment }) => {
    const [result] = await db.execute(
        "INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)",
        [userId, product_id, Number(rating), comment]
    );

    const [rows] = await db.execute(
        `SELECT r.*, u.full_name, u.avatar
         FROM reviews r
         LEFT JOIN users u ON r.user_id = u.id
         WHERE r.id = ?`,
        [result.insertId]
    );
    return rows[0] || null;
};

exports.updateReview = async (id, userId, { rating, comment }) => {
    const [result] = await db.execute(
        "UPDATE reviews SET rating = ?, comment = ? WHERE id = ? AND user_id = ?",
        [Number(rating), comment, id, userId]
    );

    if (result.affectedRows === 0) {
        return null;
    }

    const [rows] = await db.execute(
        `SELECT r.*, u.full_name, u.avatar
         FROM reviews r
         LEFT JOIN users u ON r.user_id = u.id
         WHERE r.id = ? AND r.user_id = ?`,
        [id, userId]
    );
    return rows[0] || null;
};

exports.deleteReview = async (id, userId) => {
    const [rows] = await db.execute(
        `SELECT r.*, u.full_name, u.avatar
         FROM reviews r
         LEFT JOIN users u ON r.user_id = u.id
         WHERE r.id = ? AND r.user_id = ?`,
        [id, userId]
    );
    if (rows.length === 0) {
        return null;
    }

    await db.execute("DELETE FROM reviews WHERE id = ? AND user_id = ?", [id, userId]);
    return rows[0];
};
