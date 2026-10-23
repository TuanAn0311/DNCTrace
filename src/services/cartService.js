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
    const [products] = await db.execute("SELECT id, name, stock, status FROM products WHERE id = ?", [product_id]);
    if (products.length === 0 || Number(products[0].status) !== 1) {
        const error = new Error("Sản phẩm không tồn tại hoặc chưa mở bán!");
        error.statusCode = 404;
        throw error;
    }

    const product = products[0];

    const [existing] = await db.execute(
        "SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?",
        [userId, product_id]
    );

    const currentQty = existing.length > 0 ? Number(existing[0].quantity) : 0;
    const newQty = currentQty + Number(quantity);

    if (newQty > Number(product.stock)) {
        const error = new Error(`Sản phẩm "${product.name}" chỉ còn ${product.stock} sản phẩm trong kho!`);
        error.statusCode = 400;
        throw error;
    }

    let cartId;
    if (existing.length > 0) {
        await db.execute("UPDATE cart SET quantity = ? WHERE id = ?", [newQty, existing[0].id]);
        cartId = existing[0].id;
    } else {
        const [result] = await db.execute(
            "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
            [userId, product_id, Number(quantity)]
        );
        cartId = result.insertId;
    }

    const [rows] = await db.execute("SELECT * FROM cart WHERE id = ?", [cartId]);
    return rows[0] || null;
};

exports.updateCartItem = async (userId, id, quantity) => {
    const [cartRows] = await db.execute(
        `SELECT c.id, c.product_id, p.name, p.stock
         FROM cart c
         JOIN products p ON c.product_id = p.id
         WHERE c.id = ? AND c.user_id = ?`,
        [id, userId]
    );

    if (cartRows.length === 0) {
        return null;
    }

    if (Number(quantity) > Number(cartRows[0].stock)) {
        const error = new Error(`Sản phẩm "${cartRows[0].name}" chỉ còn ${cartRows[0].stock} sản phẩm trong kho!`);
        error.statusCode = 400;
        throw error;
    }

    await db.execute("UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?", [Number(quantity), id, userId]);

    const [rows] = await db.execute("SELECT * FROM cart WHERE id = ? AND user_id = ?", [id, userId]);
    return rows[0] || null;
};

exports.updateCartItemByProduct = async (userId, product_id, quantity) => {
    const [cartRows] = await db.execute(
        `SELECT c.id, c.product_id, p.name, p.stock
         FROM cart c
         JOIN products p ON c.product_id = p.id
         WHERE c.user_id = ? AND c.product_id = ?`,
        [userId, product_id]
    );

    if (cartRows.length === 0) {
        return null;
    }

    if (Number(quantity) > Number(cartRows[0].stock)) {
        const error = new Error(`Sản phẩm "${cartRows[0].name}" chỉ còn ${cartRows[0].stock} sản phẩm trong kho!`);
        error.statusCode = 400;
        throw error;
    }

    await db.execute(
        "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?",
        [Number(quantity), userId, product_id]
    );

    const [rows] = await db.execute(
        "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
        [userId, product_id]
    );
    return rows[0] || null;
};

exports.removeCartItem = async (userId, id) => {
    const [rows] = await db.execute("SELECT * FROM cart WHERE id = ? AND user_id = ?", [id, userId]);
    if (rows.length === 0) {
        return null;
    }

    await db.execute("DELETE FROM cart WHERE id = ? AND user_id = ?", [id, userId]);
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
