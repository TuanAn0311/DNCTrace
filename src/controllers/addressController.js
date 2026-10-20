const addressService = require("../services/addressService");

exports.getAddresses = async (req, res) => {
    try {
        const userId = req.user.id;
        const addresses = await addressService.getAddressesByUserId(userId);
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

        const newAddress = await addressService.createAddress(userId, {
            full_name,
            phone,
            address_line,
            district,
            city,
            is_default,
        });

        res.status(201).json({
            success: true,
            message: "Thêm địa chỉ thành công!",
            id: newAddress?.id,
            data: newAddress,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { full_name, phone, address_line, district, city, is_default = 0 } = req.body;

        const updatedAddress = await addressService.updateAddress(userId, id, {
            full_name,
            phone,
            address_line,
            district,
            city,
            is_default,
        });

        if (!updatedAddress) {
            return res.status(404).json({ success: false, message: "Không tìm thấy địa chỉ!" });
        }

        res.json({
            success: true,
            message: "Cập nhật địa chỉ thành công!",
            data: updatedAddress,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const deletedAddress = await addressService.deleteAddress(userId, id);

        if (!deletedAddress) {
            return res.status(404).json({ success: false, message: "Không tìm thấy địa chỉ!" });
        }

        res.json({
            success: true,
            message: "Xóa địa chỉ thành công!",
            data: deletedAddress,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
