const db = require("../config/db");

exports.getAllProducts = async (req, res) => {
  try {
    const [products] = await db.execute("SELECT * FROM products ORDER BY created_at DESC");
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  const { name, price, image, description, origin, stock, status = 1 } = req.body;
  try {
    if (!name || Number(price) <= 0 || Number(stock) < 0) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đúng thông tin sản phẩm!" });
    }

    await db.execute(
      "INSERT INTO products (name, price, image, description, origin, stock, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, price, image || null, description || null, origin || null, Number(stock), Number(status)]
    );
    res.json({ success: true, message: "Thêm sản phẩm thành công!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const [products] = await db.execute("SELECT * FROM products WHERE id = ?", [id]);

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }
    res.json({ success: true, data: products[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, description, image, origin, stock, status } = req.body;
  try {
    if (!name || Number(price) <= 0 || Number(stock) < 0 || ![0, 1].includes(Number(status))) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đúng thông tin sản phẩm!" });
    }

    const [result] = await db.execute(
      "UPDATE products SET name=?, price=?, description=?, image=?, origin=?, stock=?, status=? WHERE id=?",
      [name, price, description || null, image || null, origin || null, Number(stock), Number(status), id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm!" });
    }

    res.json({ success: true, message: "Cập nhật sản phẩm thành công!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const [products] = await db.execute("SELECT id FROM products WHERE id=?", [id]);
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm!" });
    }

    const [orderDetails] = await db.execute("SELECT COUNT(*) AS total FROM order_details WHERE product_id=?", [id]);
    if (Number(orderDetails[0].total) > 0) {
      return res.status(409).json({
        success: false,
        message: "Không thể xóa sản phẩm đã phát sinh đơn hàng. Hãy chuyển sản phẩm về trạng thái nháp hoặc hết hàng để ngừng bán.",
      });
    }

    await db.execute("DELETE FROM products WHERE id=?", [id]);
    res.json({ success: true, message: "Xóa sản phẩm thành công!" });
  } catch (error) {
    if (error.errno === 1451 || error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        success: false,
        message: "Không thể xóa sản phẩm vì đang được tham chiếu bởi dữ liệu khác.",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.activateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (!stock || stock <= 0) {
      return res.status(400).json({ success: false, message: "Vui lòng cung cấp số lượng thành phần lớn hơn 0 để kích hoạt sản phẩm!" });
    }
    await db.execute("UPDATE products SET status=1, stock=? WHERE id=?", [stock, id]);
    res.json({ success: true, message: "Sản phẩm đã được kích hoạt!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPublicProducts = async (req, res) => {
  try {
    const [products] = await db.execute("SELECT * FROM products WHERE status=1");
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
