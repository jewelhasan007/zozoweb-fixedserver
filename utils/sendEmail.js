import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // ✅ FIX: Removed transporter.verify() — it opens a persistent socket
  // connection which hangs/times out in Vercel's serverless environment.

  const info = await transporter.sendMail({
    from: `"ZOZOWeb" <${process.env.SMTP_USER}>`,
    to: Array.isArray(to) ? to.join(",") : to,
    subject,
    text,
    html,
  });

  console.log("📨 Email sent:", info.messageId);
  return info;
};

export default sendEmail;
