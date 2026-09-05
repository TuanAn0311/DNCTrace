const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, htmlContent) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com", // Bắt buộc phải trỏ đến máy chủ của Google
            port: 587, // Cổng bảo mật TLS
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const info = await transporter.sendMail({
            from: `"DNC Trace" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: htmlContent,
        });

        return true;
    } catch (error) {
        throw error;
    }
};

module.exports = sendEmail;
