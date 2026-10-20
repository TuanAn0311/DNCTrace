const db = require("../config/db");

exports.getAllProducts = async () => {
    const [products] = await db.execute("SELECT * FROM products ORDER BY created_at DESC");
    return products;
};

exports.createProduct = async ({ name, price, image, description, origin, stock, status = 1 }) => {
    const [result] = await db.execute(
        "INSERT INTO products (name, price, image, description, origin, stock, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [name, price, image || null, description || null, origin || null, Number(stock), Number(status)]
    );

    const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [result.insertId]);
    return rows[0] || null;
};

exports.getProductById = async (id) => {
    const [products] = await db.execute("SELECT * FROM products WHERE id = ?", [id]);
    return products[0] || null;
};

exports.updateProduct = async (id, { name, price, description, image, origin, stock, status }) => {
    const [result] = await db.execute(
        "UPDATE products SET name=?, price=?, description=?, image=?, origin=?, stock=?, status=? WHERE id=?",
        [name, price, description || null, image || null, origin || null, Number(stock), Number(status), id]
    );

    if (result.affectedRows === 0) {
        return null;
    }

    const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [id]);
    return rows[0] || null;
};

exports.deleteProduct = async (id) => {
    const [products] = await db.execute("SELECT * FROM products WHERE id=?", [id]);
    if (products.length === 0) {
        const error = new Error("Không tìm thấy sản phẩm!");
        error.statusCode = 404;
        throw error;
    }

    const [orderDetails] = await db.execute("SELECT COUNT(*) AS total FROM order_details WHERE product_id=?", [id]);
    if (Number(orderDetails[0].total) > 0) {
        const error = new Error(
            "Không thể xóa sản phẩm đã phát sinh đơn hàng. Hãy chuyển sản phẩm về trạng thái nháp hoặc hết hàng để ngừng bán."
        );
        error.statusCode = 409;
        throw error;
    }

    await db.execute("DELETE FROM products WHERE id=?", [id]);
    return products[0];
};

exports.activateProduct = async (id, stock) => {
    const [result] = await db.execute("UPDATE products SET status=1, stock=? WHERE id=?", [stock, id]);
    if (result.affectedRows === 0) {
        return null;
    }

    const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [id]);
    return rows[0] || null;
};

exports.getPublicProducts = async () => {
    const [products] = await db.execute("SELECT * FROM products WHERE status=1");
    return products;
};

