import sendEmail from "../utils/sendEmail.js";
import express from 'express';
import Newsletter from '../models/Newsletter.js';
import connectDB from '../config/db.js';
import protect from "../middleware/authMiddleware.js";
import EmailLog from "../models/EmailLog.js"; // ✅ moved to top

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

// ✅ PROTECTED - Send email to all subscribers
router.post("/send", protect, async (req, res) => {
  try {
    await connectDB();
    console.log("📩 Send email API HIT");

    const { subject, message, html } = req.body; // ✅ destructure html

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

    // Send in batches of 50
    const batchSize = 50;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      console.log(`🚀 Sending batch ${i / batchSize + 1}`);
      await sendEmail({
        to: batch,
        subject,
        text: message,
        html: html || `<p>${message}</p>`, // ✅ use custom HTML with image if provided
      });
    }

    // ✅ Save success log
    await EmailLog.create({
      subject,
      message,
      sentTo: emails.length,
      status: "success",
    });

    console.log("✅ All emails sent successfully");
    res.status(200).json({
      success: true,
      message: "Emails sent to all subscribers successfully",
    });

  } catch (error) {
    console.error("❌ EMAIL SEND ERROR:", error);

    // ✅ Save failed log
    await EmailLog.create({
      subject: req.body.subject || "Unknown",
      message: req.body.message || "Unknown",
      sentTo: 0,
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