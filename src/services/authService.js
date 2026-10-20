const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

exports.registerUser = async ({ email, password, full_name, phone }) => {
    const [existingUsers] = await db.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
        const error = new Error("Email này đã được sử dụng!");
        error.statusCode = 400;
        throw error;
    }

    // salt là một chuỗi ngẫu nhiên được sử dụng để tăng cường bảo mật của mật khẩu khi băm. Nó giúp làm cho việc băm mật khẩu trở nên khó đoán hơn và chống lại các cuộc tấn công từ điển hoặc tấn công bằng cách thử tất cả các kết hợp có thể.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userRole = "user";
    const provider = "local";

    const [result] = await db.execute(
        "INSERT INTO users (email, password, full_name, phone, role, provider) VALUES (?, ?, ?, ?, ?, ?)",
        [email, hashedPassword, full_name, phone || null, userRole, provider]
    );

    const [users] = await db.execute(
        "SELECT id, email, full_name, phone, avatar, role, provider, created_at FROM users WHERE id = ?",
        [result.insertId]
    );

    return users[0] || null;
};

exports.loginUser = async ({ email, password }) => {
    const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
        const error = new Error("Email hoặc mật khẩu không đúng!");
        error.statusCode = 400;
        throw error;
    }

    const user = users[0];

    if (user.provider && user.provider !== "local") {
        const error = new Error("Tài khoản này được liên kết với Google. Vui lòng bấm Đăng nhập bằng Google!");
        error.statusCode = 400;
        throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const error = new Error("Email hoặc mật khẩu không đúng!");
        error.statusCode = 400;
        throw error;
    }

    // payload là dữ liệu mà bạn muốn mã hóa và đưa vào token JWT. Trong trường hợp này, payload chứa thông tin cơ bản về người dùng, bao gồm id, email và role. Khi token được tạo ra, payload này sẽ được mã hóa và có thể được giải mã sau này để xác thực người dùng.
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    delete user.password;

    return { token, user };
};

exports.getUserById = async (userId) => {
    const [users] = await db.execute(
        "SELECT id, email, full_name, phone, avatar, role, provider, created_at FROM users WHERE id = ?",
        [userId]
    );

    return users[0] || null;
};

exports.updateUserProfile = async (userId, { email, full_name, phone, avatar }) => {
    const [existingUsers] = await db.execute("SELECT id FROM users WHERE email = ? AND id <> ?", [email, userId]);

    if (existingUsers.length > 0) {
        const error = new Error("Email này đã được sử dụng!");
        error.statusCode = 400;
        throw error;
    }

    await db.execute(
        "UPDATE users SET email = ?, full_name = ?, phone = ?, avatar = ? WHERE id = ?",
        [email, full_name, phone || null, avatar || null, userId]
    );

    const [users] = await db.execute(
        "SELECT id, email, full_name, phone, avatar, role, provider, created_at FROM users WHERE id = ?",
        [userId]
    );

    return users[0] || null;
};

