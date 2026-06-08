import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 5000, // ✅ 5 seconds max
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });

  const info = await transporter.sendMail({
    from: `"ZOZOWeb" <${process.env.SMTP_USER}>`,
    to: Array.isArray(to) ? to.join(",") : to,
    subject,
    text,
    html,
  });

  return info;
};

export default sendEmail; 