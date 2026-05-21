const nodemailer = require("nodemailer");

const sendEmail = async (toEmail, subject, htmlContent) => {
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailFrom =
      process.env.EMAIL_FROM || `"DNC Trace" <${emailUser || "no-reply@dnctrace.local"}>`;

    if (!emailUser || !emailPass) {
      console.warn("Email config is missing. Skip sending email.");
      return;
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
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};

module.exports = sendEmail;
