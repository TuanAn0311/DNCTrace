// config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then(connection => {
        console.log('✅ Kết nối MySQL (dnc_trace) thành công!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Lỗi kết nối Database:', err.message);
    });

module.exports = pool;
