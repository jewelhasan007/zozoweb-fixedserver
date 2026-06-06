import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
      connectionTimeout: 10000,  // ✅ 10 seconds
  greetingTimeout: 10000,    // ✅ 10 seconds
  socketTimeout: 10000,      // ✅ 10 seconds
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


// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);

// const sendEmail = async ({ to, subject, text, html }) => {
//   const { data, error } = await resend.emails.send({
//     from: 'ZOZOWeb <onboarding@resend.dev>', // ✅ use this exactly
//     to: Array.isArray(to) ? to : [to],
//     subject,
//     text,
//     html,
//   });

//   if (error) throw new Error(error.message);
  
//   console.log("📨 Email sent:", data?.id);
//   return data;
// };

// export default sendEmail;



// import { Resend } from 'resend';

// const resend = new Resend('re_ZvPjgXWB_M9zp11cWkGxqTnUa977XHELm');

// resend.emails.send({
//   from: 'onboarding@resend.dev',
//   to: 'zigzag.minded@gmail.com',
//   subject: 'Hello World',
//   html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
// });