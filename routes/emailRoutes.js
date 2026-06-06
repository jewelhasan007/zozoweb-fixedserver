// routes/newsletter.js
import { sendEmail } from "../utils/sendEmail.js";
import express from "express";
import Newsletter from "../models/Newsletter.js";


const router = express.Router();



router.post("/send", async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: "Subject and message required" });
    }

    const subscribers = await Newsletter.find().select("email -_id");
    const emails = subscribers.map((sub) => sub.email);

    if (emails.length === 0) {
      return res.status(400).json({ error: "No subscribers found" });
    }

    console.log("Sending email to:", emails);

    await sendEmail({
      to: emails,
      subject,
      text: message,
      html: `<p>${message}</p>`,
    });

    res.status(200).json({ success: true, message: "Emails sent successfully" });
  } catch (error) {
    console.error("❌ FULL ERROR:", error); // 🔥 log full error
    res.status(500).json({ error: error.message || "Server error" });
  }
});
export default router;