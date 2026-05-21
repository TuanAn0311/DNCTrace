const db = require("../config/db");

exports.addToCart = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id, quantity } = req.body;
    const requestedQuantity = Number(quantity) || 1;

    if (!product_id || requestedQuantity < 1) {
      return res.status(400).json({ success: false, message: "Du lieu gio hang khong hop le!" });
    }

    const [products] = await db.execute(
      "SELECT id, stock, status FROM products WHERE id = ?",
      [product_id],
    );

    if (products.length === 0 || Number(products[0].status) !== 1) {
      return res.status(404).json({ success: false, message: "San pham khong ton tai hoac chua mo ban!" });
    }

    const [items] = await db.execute(
      "SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?",
      [user_id, product_id],
    );

    const currentQuantity = Number(items[0]?.quantity || 0);
    const nextQuantity = currentQuantity + requestedQuantity;

    if (Number(products[0].stock) < nextQuantity) {
      return res.status(400).json({ success: false, message: "So luong vuot qua ton kho hien co!" });
    }

    if (items.length > 0) {
      await db.execute(
        "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?",
        [nextQuantity, user_id, product_id],
      );
    } else {
      await db.execute(
        "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
        [user_id, product_id, requestedQuantity],
      );
    }

    res.json({ success: true, message: "Da them vao gio hang!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const user_id = req.user.id;
    const [cartItems] = await db.execute(
      `SELECT c.id as cart_id, c.product_id, c.quantity, p.name, p.price, p.image, p.stock
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [user_id],
    );
    res.json({ success: true, data: cartItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkout = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const user_id = req.user.id;
    const { fullName, phone, address, paymentMethod } = req.body;

    if (!fullName || !phone || !address) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Vui long nhap day du thong tin giao hang!",
      });
    }

    const [cartItems] = await connection.execute(
      `SELECT c.product_id, c.quantity, p.price, p.stock, p.name
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [user_id],
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Gio hang dang trong!" });
    }

    const outOfStockItem = cartItems.find((item) => Number(item.stock) < Number(item.quantity));
    if (outOfStockItem) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `San pham "${outOfStockItem.name}" khong du ton kho!`,
      });
    }

    const totalPrice = cartItems.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0,
    );

    const [orderResult] = await connection.execute(
      `INSERT INTO orders (user_id, full_name, phone, address, total_price, payment_method)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, fullName, phone, address, totalPrice, paymentMethod || "COD"],
    );

    const newOrderId = orderResult.insertId;

    for (const item of cartItems) {
      await connection.execute(
        `INSERT INTO order_details (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [newOrderId, item.product_id, item.quantity, item.price],
      );

      const [stockResult] = await connection.execute(
        "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?",
        [item.quantity, item.product_id, item.quantity],
      );

      if (stockResult.affectedRows === 0) {
        throw new Error(`San pham "${item.name}" khong du ton kho!`);
      }
    }

    await connection.execute("DELETE FROM cart WHERE user_id = ?", [user_id]);
    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Dat hang thanh cong!",
      orderId: newOrderId,
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError);
    }
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const user_id = req.user.id;
    const [orders] = await db.execute(
      "SELECT id, total_price, payment_method, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [user_id],
    );
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { orderId } = req.params;

    const [orders] = await db.execute(
      "SELECT id FROM orders WHERE id = ? AND user_id = ?",
      [orderId, user_id],
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: "Khong tim thay don hang" });
    }

    const [details] = await db.execute(
      `SELECT od.quantity, od.price, od.product_id, p.name, p.image
       FROM order_details od
       JOIN products p ON od.product_id = p.id
       WHERE od.order_id = ?`,
      [orderId],
    );

    res.json({ success: true, data: details });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id, quantity } = req.body;
    const nextQuantity = Number(quantity);

    if (!product_id || !Number.isInteger(nextQuantity) || nextQuantity < 1) {
      return res.status(400).json({ success: false, message: "So luong khong hop le!" });
    }

    const [products] = await db.execute(
      "SELECT stock, status FROM products WHERE id = ?",
      [product_id],
    );

    if (products.length === 0 || Number(products[0].status) !== 1) {
      return res.status(404).json({ success: false, message: "San pham khong ton tai hoac chua mo ban!" });
    }

    if (Number(products[0].stock) < nextQuantity) {
      return res.status(400).json({ success: false, message: "So luong vuot qua ton kho hien co!" });
    }

    await db.execute(
      "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?",
      [nextQuantity, user_id, product_id],
    );
    res.json({ success: true, message: "Da cap nhat so luong" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { productId } = req.params;

    await db.execute("DELETE FROM cart WHERE user_id = ? AND product_id = ?", [
      user_id,
      productId,
    ]);
    res.json({ success: true, message: "Da xoa san pham" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
