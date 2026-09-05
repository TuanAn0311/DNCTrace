const db = require("../config/db");

exports.getAddresses = async (req, res) => {
    try {
        const userId = req.user.id;
        const [addresses] = await db.execute("SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC", [userId]);
        res.json({ success: true, data: addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { full_name, phone, address_line, district, city, is_default = 0 } = req.body;

        if (!full_name || !phone || !address_line || !district || !city) {
            return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin địa chỉ!" });
        }

        if (Number(is_default) === 1) {
            await db.execute("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?", [userId]);
        }

        const [result] = await db.execute("INSERT INTO user_addresses (user_id, full_name, phone, address_line, district, city, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)", [
            userId,
            full_name,
            phone,
            address_line,
            district,
            city,
            Number(is_default),
        ]);

        const [addresses] = await db.execute("SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC", [userId]);

        res.status(201).json({ success: true, message: "Thêm địa chỉ thành công!", id: result.insertId, data: addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { full_name, phone, address_line, district, city, is_default = 0 } = req.body;

        if (Number(is_default) === 1) {
            await db.execute("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?", [userId]);
        }

        const [result] = await db.execute("UPDATE user_addresses SET full_name = ?, phone = ?, address_line = ?, district = ?, city = ?, is_default = ? WHERE id = ? AND user_id = ?", [
            full_name,
            phone,
            address_line,
            district,
            city,
            Number(is_default),
            id,
            userId,
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy địa chỉ!" });
        }

        const [addresses] = await db.execute("SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC", [userId]);

        res.json({ success: true, message: "Cập nhật địa chỉ thành công!", data: addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const [result] = await db.execute("DELETE FROM user_addresses WHERE id = ? AND user_id = ?", [id, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy địa chỉ!" });
        }

        const [addresses] = await db.execute("SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC", [userId]);

        res.json({ success: true, message: "Xóa địa chỉ thành công!", data: addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
