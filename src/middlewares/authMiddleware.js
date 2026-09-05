const jwt = require("jsonwebtoken");

// ==================== AUTH MIDDLEWARE ====================
const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Từ chối truy cập. Vui lòng đăng nhập!",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Giải mã token và lấy thông tin người dùng
    req.user = decoded;
    next();
    } catch (_error) {
    res.status(403).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn!" });
  }
};

// ==================== ADMIN MIDDLEWARE ====================
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ success: false, message: "Bạn không có quyền Admin!" });
    }
  });
};

module.exports = { verifyToken, verifyAdmin };
