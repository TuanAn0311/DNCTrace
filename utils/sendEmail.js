// sendEmail.js sẽ sử dụng thư viện nodemailer để gửi email thông báo cho người dùng, ví dụ như khi họ đặt hàng thành công hoặc khi có cập nhật về đơn hàng. Hàm sendEmail sẽ nhận vào địa chỉ email người nhận, tiêu đề và nội dung HTML của email, sau đó cấu hình transporter với thông tin email từ biến môi trường và gửi email đi.
const nodemailer = require("nodemailer");

const sendEmail = async (toEmail, subject, htmlContent) => {
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailFrom = process.env.EMAIL_FROM || `"DNC Trace" <${emailUser}>`;

    if (!emailUser || !emailPass) {
      console.warn("Email config is missing. Skip sending email.");
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    await transporter.sendMail({
      from: emailFrom,
      to: toEmail,
      subject,
      html: htmlContent,
    });

    console.log(`Email sent successfully to ${toEmail}`);
    return true;
  } catch (error) {
    if (error.code === "EAUTH" || error.responseCode === 535) {
      console.error(
        "Failed to send email: Gmail rejected EMAIL_USER/EMAIL_PASS. Use a Gmail App Password, not the normal account password."
      );
      return false;
    }

    console.error("Failed to send email:", error);
    return false;
  }
};

module.exports = sendEmail;
