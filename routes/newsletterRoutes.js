import sendEmail from "../utils/sendEmail.js";
import express from 'express';
import Newsletter from '../models/Newsletter.js';
import connectDB from '../config/db.js';
import protect from "../middleware/authMiddleware.js";
import EmailLog from "../models/EmailLog.js";

const router = express.Router();

// ✅ PUBLIC - Subscribe
router.post('/', async (req, res) => {
  console.log("API HIT");
  try {
    await connectDB();

    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const existing = await Newsletter.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already subscribed' });

    const newSubscriber = new Newsletter({ email });
    await newSubscriber.save();

    res.status(200).json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ PROTECTED - Get all subscribers
router.get("/", protect, async (req, res) => {
  try {
    await connectDB();
    const subscribers = await Newsletter.find()
      .sort({ subscribedAt: -1 })
      .select("email subscribedAt");
    res.status(200).json(subscribers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ PROTECTED - Send email to all subscribers individually
router.post("/send", protect, async (req, res) => {
  try {
    await connectDB();
    console.log("📩 Send email API HIT");

    const { subject, message, html } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        error: "Subject and message are required",
      });
    }

    const subscribers = await Newsletter.find().select("email -_id");

    if (!subscribers.length) {
      return res.status(400).json({
        success: false,
        error: "No subscribers found",
      });
    }

    const emails = subscribers.map((sub) => sub.email);
    console.log("📧 Total subscribers:", emails.length);

    // ✅ Send all emails in parallel - much faster than sequential
    const emailPromises = emails.map((email) =>
      sendEmail({
        to: email,
        subject,
        text: message,
        html: html || `<p>${message}</p>`,
      })
        .then(() => console.log(`✅ Sent to: ${email}`))
        .catch((err) => console.error(`❌ Failed to send to ${email}:`, err.message))
    );

    await Promise.all(emailPromises);

    // ✅ Save success log with hasImage
    await EmailLog.create({
      subject,
      message,
      sentTo: emails.length,
      hasImage: !!html && html.includes("<img"),
      status: "success",
    });

    console.log("✅ All emails sent successfully");
    res.status(200).json({
      success: true,
      message: "Emails sent to all subscribers successfully",
    });

  } catch (error) {
    console.error("❌ EMAIL SEND ERROR:", error);

    await EmailLog.create({
      subject: req.body.subject || "Unknown",
      message: req.body.message || "Unknown",
      sentTo: 0,
      hasImage: !!req.body.html && req.body.html.includes("<img"),
      status: "failed",
      error: error.message,
    });

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ✅ PROTECTED - Get email send history logs
router.get("/logs", protect, async (req, res) => {
  try {
    await connectDB();
    const logs = await EmailLog.find().sort({ sentAt: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;