const db = require('../config/db');
const sendEmail = require('../utils/sendEmail');

exports.placeOrder = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const userId = req.user.id;
        const { address_id, payment_method = 'COD' } = req.body;

        if (!address_id) {
            return res.status(400).json({ success: false, message: 'Vui long chon dia chi giao hang!' });
        }

        if (!['COD', 'QR'].includes(payment_method)) {
            return res.status(400).json({ success: false, message: 'Phuong thuc thanh toan khong hop le!' });
        }

        await connection.beginTransaction();

        const [addresses] = await connection.execute(
            'SELECT * FROM user_addresses WHERE id = ? AND user_id = ?',
            [address_id, userId],
        );

        if (addresses.length === 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Dia chi khong hop le!' });
        }

        const address = addresses[0];
        const fullAddress = `${address.address_line}, ${address.district}, ${address.city}`;

        const [cartItems] = await connection.execute(
            `SELECT c.product_id, c.quantity, p.name, p.price, p.stock
             FROM cart c
             JOIN products p ON c.product_id = p.id
             WHERE c.user_id = ?`,
            [userId],
        );

        if (cartItems.length === 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Gio hang cua ban dang trong!' });
        }

        const outOfStockItem = cartItems.find((item) => Number(item.stock) < Number(item.quantity));
        if (outOfStockItem) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `San pham "${outOfStockItem.name}" khong du ton kho!`,
            });
        }

        const total_price = cartItems.reduce(
            (sum, item) => sum + Number(item.price) * Number(item.quantity),
            0,
        );

        const [orderResult] = await connection.execute(
            'INSERT INTO orders (user_id, full_name, phone, address, total_price, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, address.full_name, address.phone, fullAddress, total_price, payment_method, 'pending'],
        );
        const orderId = orderResult.insertId;

        for (const item of cartItems) {
            await connection.execute(
                'INSERT INTO order_details (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price],
            );

            const [stockResult] = await connection.execute(
                'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
                [item.quantity, item.product_id, item.quantity],
            );

            if (stockResult.affectedRows === 0) {
                throw new Error(`San pham "${item.name}" khong du ton kho!`);
            }
        }

        await connection.execute('DELETE FROM cart WHERE user_id = ?', [userId]);

        const [users] = await connection.execute('SELECT email FROM users WHERE id = ?', [userId]);
        const userEmail = users[0]?.email;

        await connection.commit();

        const itemsHtml = cartItems
            .map((item) => `<li>${item.name} - SL: ${item.quantity} - Don gia: ${Number(item.price).toLocaleString()} VND</li>`)
            .join('');

        const emailContent = `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #28a745;">Cam on ban da dat hang tai DNC Trace!</h2>
                <p>Ma don hang cua ban la: <strong>#${orderId}</strong></p>
                <p>Phuong thuc thanh toan: <strong>${payment_method === 'QR' ? 'Chuyen khoan VietQR' : 'Thanh toan khi nhan hang (COD)'}</strong></p>
                <h3>Chi tiet don hang:</h3>
                <ul>${itemsHtml}</ul>
                <h3 style="color: #d9534f;">Tong thanh toan: ${total_price.toLocaleString()} VND</h3>
                <p><strong>Dia chi giao hang:</strong> ${address.full_name} - ${address.phone} <br/> ${fullAddress}</p>
                <hr/>
                <p style="font-size: 12px; color: #888;">Ban co the theo doi tinh minh bach cua san pham tren Blockchain tai website cua chung toi.</p>
            </div>
        `;

        if (userEmail) {
            sendEmail(userEmail, `Xac nhan don hang #${orderId} - DNC Trace`, emailContent).catch(console.error);
        }

        res.json({ success: true, message: 'Dat hang thanh cong!', order_id: orderId });
    } catch (error) {
        try {
            await connection.rollback();
        } catch (rollbackError) {
            console.error('Rollback failed:', rollbackError);
        }
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

exports.confirmReceivedByUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const [orders] = await db.execute(
            'SELECT status FROM orders WHERE id = ? AND user_id = ?',
            [id, userId],
        );

        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Khong tim thay don hang!' });
        }

        if (orders[0].status !== 'shipped') {
            return res.status(400).json({ success: false, message: "Don hang phai o trang thai 'Dang giao' moi co the xac nhan!" });
        }

        await db.execute('UPDATE orders SET status = "delivered" WHERE id = ?', [id]);

        res.json({ success: true, message: 'Xac nhan da nhan hang thanh cong!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllOrdersAdmin = async (req, res) => {
    try {
        const [orders] = await db.execute('SELECT * FROM orders ORDER BY created_at DESC');
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllOrdersDetailAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const [details] = await db.execute(
            'SELECT od.*, p.name, p.image FROM order_details od JOIN products p ON od.product_id = p.id WHERE od.order_id = ?',
            [id],
        );
        res.json({ success: true, data: details });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Trang thai don hang khong hop le!' });
        }

        await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

        res.json({ success: true, message: 'Trang thai don hang da duoc cap nhat!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const [revenueResult] = await db.execute('SELECT SUM(total_price) as totalRevenue FROM orders WHERE status = "delivered"');
        const totalRevenue = revenueResult[0].totalRevenue || 0;

        const [ordersResult] = await db.execute('SELECT COUNT(id) as totalOrders FROM orders');
        const totalOrders = ordersResult[0].totalOrders || 0;

        const [statusData] = await db.execute('SELECT status, COUNT(id) as count FROM orders GROUP BY status');

        const [monthlyRevenue] = await db.execute(`
            SELECT DATE_FORMAT(created_at, '%m/%Y') as month, SUM(total_price) as revenue
            FROM orders
            WHERE status = 'delivered'
            GROUP BY month
            ORDER BY MIN(created_at) DESC
            LIMIT 6
        `);

        res.json({
            success: true,
            data: {
                totalRevenue,
                totalOrders,
                statusData,
                monthlyRevenue: monthlyRevenue.reverse(),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
