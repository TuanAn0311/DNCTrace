const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

exports.register = async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin bắt buộc!" });
    }

    const [existingUsers] = await db.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: "Email này đã được sử dụng!" });
    }

    const salt = await bcrypt.genSalt(10); // salt là một chuỗi ngẫu nhiên được sử dụng để tăng cường bảo mật của mật khẩu khi băm. Nó giúp làm cho việc băm mật khẩu trở nên khó đoán hơn và chống lại các cuộc tấn công từ điển hoặc tấn công bằng cách thử tất cả các kết hợp có thể.
    const hashedPassword = await bcrypt.hash(password, salt);
    const userRole = "user";
    const provider = "local";

    const [result] = await db.execute(
      "INSERT INTO users (email, password, full_name, phone, role, provider) VALUES (?, ?, ?, ?, ?, ?)",
      [email, hashedPassword, full_name, phone || null, userRole, provider]
    );

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      userId: result.insertId,
      role: userRole
    });
  } catch (error) {
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

    const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: "Email hoặc mật khẩu không đúng!" });
    }

    const user = users[0];

    if (user.provider && user.provider !== "local") {
      return res.status(400).json({
        success: false,
        message: "Tài khoản này được liên kết với Google. Vui lòng bấm Đăng nhập bằng Google!",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Email hoặc mật khẩu không đúng!" });
    }

    const payload = { // payload là dữ liệu mà bạn muốn mã hóa và đưa vào token JWT. Trong trường hợp này, payload chứa thông tin cơ bản về người dùng, bao gồm id, email và role. Khi token được tạo ra, payload này sẽ được mã hóa và có thể được giải mã sau này để xác thực người dùng.
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    delete user.password;

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công!",
      token,
      user,
    });
  } catch (error) {
    console.error("Lỗi Login:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi đăng nhập!" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const [users] = await db.execute(
      "SELECT id, email, full_name, phone, avatar, role, provider, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
    }

    res.json({ success: true, data: users[0] });
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

    const [existingUsers] = await db.execute("SELECT id FROM users WHERE email = ? AND id <> ?", [email, userId]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: "Email này đã được sử dụng!" });
    }

    await db.execute("UPDATE users SET email = ?, full_name = ?, phone = ?, avatar = ? WHERE id = ?", [email, full_name, phone || null, avatar || null, userId]);

    const [users] = await db.execute(
      "SELECT id, email, full_name, phone, avatar, role, provider, created_at FROM users WHERE id = ?",
      [userId]
    );

    res.json({ success: true, message: "Cập nhật hồ sơ thành công!", data: users[0] });
  } catch (error) {
    console.error("Lỗi updateProfile:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi cập nhật hồ sơ!" });
  }
};
