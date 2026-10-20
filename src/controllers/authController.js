const authService = require("../services/authService");

exports.register = async (req, res) => {
    try {
        const { email, password, full_name, phone } = req.body;

        if (!email || !password || !full_name) {
            return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin bắt buộc!" });
        }

        const newUser = await authService.registerUser({ email, password, full_name, phone });

        res.status(201).json({
            success: true,
            message: "Đăng ký thành công!",
            userId: newUser?.id,
            role: newUser?.role,
            data: newUser,
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        console.error("Lỗi Register:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi đăng ký!" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập email và mật khẩu!" });
        }

        const { token, user } = await authService.loginUser({ email, password });

        res.status(200).json({
            success: true,
            message: "Đăng nhập thành công!",
            token,
            user,
            data: user,
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        console.error("Lỗi Login:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi đăng nhập!" });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await authService.getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        console.error("Lỗi getMe:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi tải hồ sơ!" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { email, full_name, phone, avatar } = req.body;

        if (!email || !full_name) {
            return res.status(400).json({ success: false, message: "Email và họ tên là bắt buộc!" });
        }

        const updatedUser = await authService.updateUserProfile(userId, { email, full_name, phone, avatar });

        res.json({
            success: true,
            message: "Cập nhật hồ sơ thành công!",
            data: updatedUser,
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        console.error("Lỗi updateProfile:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi cập nhật hồ sơ!" });
    }
};
