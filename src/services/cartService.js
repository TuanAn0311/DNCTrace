const db = require("../config/db");

exports.getCartByUserId = async (userId) => {
    const [items] = await db.execute(
        `SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.image, p.stock
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
        [userId]
    );
    return items;
};

exports.addToCart = async (userId, { product_id, quantity = 1 }) => {
    const [existing] = await db.execute(
        "SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?",
        [userId, product_id]
    );

    let cartId;
    if (existing.length > 0) {
        const newQty = Number(existing[0].quantity) + Number(quantity);
        await db.execute("UPDATE cart SET quantity = ? WHERE id = ?", [newQty, existing[0].id]);
        cartId = existing[0].id;
    } else {
        const [result] = await db.execute(
            "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
            [userId, product_id, quantity]
        );
        cartId = result.insertId;
    }

    const [rows] = await db.execute("SELECT * FROM cart WHERE id = ?", [cartId]);
    return rows[0] || null;
};

exports.updateCartItem = async (id, quantity) => {
    const [result] = await db.execute("UPDATE cart SET quantity = ? WHERE id = ?", [quantity, id]);
    if (result.affectedRows === 0) {
        return null;
    }

    const [rows] = await db.execute("SELECT * FROM cart WHERE id = ?", [id]);
    return rows[0] || null;
};

exports.updateCartItemByProduct = async (userId, product_id, quantity) => {
    const [result] = await db.execute(
        "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?",
        [quantity, userId, product_id]
    );
    if (result.affectedRows === 0) {
        return null;
    }

    const [rows] = await db.execute(
        "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
        [userId, product_id]
    );
    return rows[0] || null;
};

exports.removeCartItem = async (id) => {
    const [rows] = await db.execute("SELECT * FROM cart WHERE id = ?", [id]);
    if (rows.length === 0) {
        return null;
    }

    await db.execute("DELETE FROM cart WHERE id = ?", [id]);
    return rows[0];
};

exports.removeCartItemByProduct = async (userId, productId) => {
    const [rows] = await db.execute(
        "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
        [userId, productId]
    );
    if (rows.length === 0) {
        return null;
    }

    await db.execute("DELETE FROM cart WHERE user_id = ? AND product_id = ?", [userId, productId]);
    return rows[0];
};

