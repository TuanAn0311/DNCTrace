const db = require("../config/db");

exports.getAddressesByUserId = async (userId) => {
    const [addresses] = await db.execute(
        "SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC",
        [userId]
    );
    return addresses;
};

exports.createAddress = async (userId, { full_name, phone, address_line, district, city, is_default = 0 }) => {
    if (Number(is_default) === 1) {
        await db.execute("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?", [userId]);
    }

    const [result] = await db.execute(
        "INSERT INTO user_addresses (user_id, full_name, phone, address_line, district, city, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [userId, full_name, phone, address_line, district, city, Number(is_default)]
    );

    const [rows] = await db.execute("SELECT * FROM user_addresses WHERE id = ?", [result.insertId]);
    return rows[0] || null;
};

exports.updateAddress = async (userId, id, { full_name, phone, address_line, district, city, is_default = 0 }) => {
    if (Number(is_default) === 1) {
        await db.execute("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?", [userId]);
    }

    const [result] = await db.execute(
        "UPDATE user_addresses SET full_name = ?, phone = ?, address_line = ?, district = ?, city = ?, is_default = ? WHERE id = ? AND user_id = ?",
        [full_name, phone, address_line, district, city, Number(is_default), id, userId]
    );

    if (result.affectedRows === 0) {
        return null;
    }

    const [rows] = await db.execute("SELECT * FROM user_addresses WHERE id = ? AND user_id = ?", [id, userId]);
    return rows[0] || null;
};

exports.setDefaultAddress = async (userId, id) => {
    const [existing] = await db.execute("SELECT * FROM user_addresses WHERE id = ? AND user_id = ?", [id, userId]);
    if (existing.length === 0) {
        return null;
    }

    await db.execute("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?", [userId]);
    await db.execute("UPDATE user_addresses SET is_default = 1 WHERE id = ? AND user_id = ?", [id, userId]);

    const [rows] = await db.execute("SELECT * FROM user_addresses WHERE id = ? AND user_id = ?", [id, userId]);
    return rows[0] || null;
};

exports.deleteAddress = async (userId, id) => {
    const [rows] = await db.execute("SELECT * FROM user_addresses WHERE id = ? AND user_id = ?", [id, userId]);
    if (rows.length === 0) {
        return null;
    }

    await db.execute("DELETE FROM user_addresses WHERE id = ? AND user_id = ?", [id, userId]);
    return rows[0];
};
