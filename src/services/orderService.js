const db = require("../config/db");
const sendEmail = require("../util/sendEmail");

exports.getUserOrders = async (userId) => {
    const [orders] = await db.execute(
        "SELECT id, total_price, payment_method, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC",
        [userId]
    );
    return orders;
};

exports.getUserOrderDetails = async (userId, orderId) => {
    const [orderCheck] = await db.execute("SELECT id FROM orders WHERE id = ? AND user_id = ?", [orderId, userId]);
    if (orderCheck.length === 0) {
        return null;
    }

    const [details] = await db.execute(
        `SELECT od.*, p.name, p.image
       FROM order_details od
       JOIN products p ON od.product_id = p.id
       WHERE od.order_id = ?`,
        [orderId]
    );
    return details;
};

exports.placeOrder = async (userId, { address_id, payment_method = "COD" }) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [addresses] = await connection.execute(
            "SELECT * FROM user_addresses WHERE id = ? AND user_id = ?",
            [address_id, userId]
        );

        if (addresses.length === 0) {
            await connection.rollback(); // rollback là quan trọng để đảm bảo rằng nếu địa chỉ không hợp lệ, các thay đổi trước đó sẽ không được commit vào database.
            const error = new Error("Dia chi khong hop le!");
            error.statusCode = 400;
            throw error;
        }

        const address = addresses[0];
        const fullAddress = `${address.address_line}, ${address.district}, ${address.city}`;

        const [cartItems] = await connection.execute(
            `SELECT c.product_id, c.quantity, p.name, p.price, p.stock
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
            [userId]
        );

        if (cartItems.length === 0) {
            await connection.rollback();
            const error = new Error("Gio hang cua ban dang trong!");
            error.statusCode = 400;
            throw error;
        }

        // Kiểm tra tồn kho trước khi tạo đơn hàng
        const outOfStockItem = cartItems.find((item) => Number(item.stock) < Number(item.quantity));
        if (outOfStockItem) {
            await connection.rollback();
            const error = new Error(`San pham "${outOfStockItem.name}" khong du ton kho!`);
            error.statusCode = 400;
            throw error;
        }

        const total_price = cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

        const [orderResult] = await connection.execute(
            "INSERT INTO orders (user_id, full_name, phone, address, total_price, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [userId, address.full_name, address.phone, fullAddress, total_price, payment_method, "pending"]
        );
        const orderId = orderResult.insertId;

        for (const item of cartItems) {
            await connection.execute(
                "INSERT INTO order_details (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
                [orderId, item.product_id, item.quantity, item.price]
            );

            const [stockResult] = await connection.execute(
                "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?",
                [item.quantity, item.product_id, item.quantity]
            );

            if (stockResult.affectedRows === 0) {
                throw new Error(`San pham "${item.name}" khong du ton kho!`);
            }
        }

        await connection.execute("DELETE FROM cart WHERE user_id = ?", [userId]);

        const [users] = await connection.execute("SELECT email FROM users WHERE id = ?", [userId]);
        const userEmail = users[0]?.email;

        const [createdOrders] = await connection.execute("SELECT * FROM orders WHERE id = ?", [orderId]);
        const createdOrder = createdOrders[0] || null;

        // 1. CHỐT DỮ LIỆU ĐƠN HÀNG VÀO DATABASE
        // Từ thời điểm này, đơn hàng đã tồn tại hợp lệ trong hệ thống
        await connection.commit();

        const itemsHtml = cartItems
            .map((item) => `<li>${item.name} - SL: ${item.quantity} - Don gia: ${Number(item.price).toLocaleString()} VND</li>`)
            .join("");

        const emailContent = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #28a745;">Cam on ban da dat hang tai DNC Trace!</h2>
        <p>Ma don hang cua ban la: <strong>#${orderId}</strong></p>
        <p>Phuong thuc thanh toan: <strong>${payment_method === "QR" ? "Chuyen khoan VietQR" : "Thanh toan khi nhan hang (COD)"}</strong></p>
        <h3>Chi tiet don hang:</h3>
        <ul>${itemsHtml}</ul>
        <h3 style="color: #d9534f;">Tong thanh toan: ${total_price.toLocaleString()} VND</h3>
        <p><strong>Dia chi giao hang:</strong> ${address.full_name} - ${address.phone} <br/> ${fullAddress}</p>
        <hr/>
        <p style="font-size: 12px; color: #888;">Ban co the theo doi tinh minh bach cua san pham tren Blockchain tai website cua chung toi.</p>
      </div>
    `;

        // 2. CÔ LẬP LUỒNG GỬI EMAIL VỚI TRY/CATCH ĐỘC LẬP
        let emailSent = false;
        if (userEmail) {
            try {
                emailSent = await sendEmail(userEmail, `Xac nhan don hang #${orderId} - DNC Trace`, emailContent);
            } catch (emailError) {
                // Bắt lỗi ECONNREFUSED và log lại để admin kiểm tra, KHÔNG ném lỗi ra luồng chính
                console.error(`[Non-critical] Lỗi gửi email cho đơn hàng #${orderId}:`, emailError.message);
            }
        }

        return {
            orderId,
            emailSent,
            order: createdOrder,
        };
    } catch (error) {
        // Chỉ rollback khi các thao tác với Database trước connection.commit() bị lỗi
        try {
            await connection.rollback();
        } catch (rollbackError) {
            console.error("Rollback failed:", rollbackError);
        }
        throw error;
    } finally {
        connection.release();
    }
};

exports.confirmReceivedByUser = async (userId, orderId) => {
    const [orders] = await db.execute("SELECT status FROM orders WHERE id = ? AND user_id = ?", [orderId, userId]);

    if (orders.length === 0) {
        const error = new Error("Khong tim thay don hang!");
        error.statusCode = 404;
        throw error;
    }

    if (orders[0].status !== "shipped") {
        const error = new Error("Don hang phai o trang thai 'Dang giao' moi co the xac nhan!");
        error.statusCode = 400;
        throw error;
    }

    await db.execute('UPDATE orders SET status = "delivered" WHERE id = ?', [orderId]);

    const [updatedOrders] = await db.execute("SELECT * FROM orders WHERE id = ?", [orderId]);
    return updatedOrders[0] || null;
};

exports.getAllOrdersAdmin = async () => {
    const [orders] = await db.execute("SELECT * FROM orders ORDER BY created_at DESC");
    return orders;
};

exports.getAllOrdersDetailAdmin = async (orderId) => {
    const [details] = await db.execute(
        "SELECT od.*, p.name, p.image FROM order_details od JOIN products p ON od.product_id = p.id WHERE od.order_id = ?",
        [orderId]
    );
    return details;
};

exports.updateOrderStatus = async (orderId, status) => {
    const [result] = await db.execute("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);
    if (result.affectedRows === 0) {
        return null;
    }

    const [orders] = await db.execute("SELECT * FROM orders WHERE id = ?", [orderId]);
    return orders[0] || null;
};

exports.getDashboardStats = async () => {
    const [revenueResult] = await db.execute('SELECT SUM(total_price) as totalRevenue FROM orders WHERE status = "delivered"');
    const totalRevenue = revenueResult[0].totalRevenue || 0;

    const [ordersResult] = await db.execute("SELECT COUNT(id) as totalOrders FROM orders");
    const totalOrders = ordersResult[0].totalOrders || 0;

    const [statusData] = await db.execute("SELECT status, COUNT(id) as count FROM orders GROUP BY status");

    const [monthlyRevenue] = await db.execute(`
      SELECT DATE_FORMAT(created_at, '%m/%Y') as month, SUM(total_price) as revenue
      FROM orders
      WHERE status = 'delivered'
      GROUP BY month
      ORDER BY MIN(created_at) DESC
      LIMIT 6
    `);

    return {
        totalRevenue,
        totalOrders,
        statusData,
        monthlyRevenue: monthlyRevenue.reverse(),
    };
};

