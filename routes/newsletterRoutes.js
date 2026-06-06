// routes/newsletter.js
import sendEmail from "../utils/sendEmail.js";
import express from 'express';
import Newsletter from '../models/Newsletter.js';

const router = express.Router();

router.post('/', async (req, res) => {
      console.log("API HIT");
  try {
    const { email } = req.body;

    // Basic validation
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email });

    if (existing) {
      return res.status(400).json({ error: 'Email already subscribed' });
    }

    // Save to DB
    const newSubscriber = new Newsletter({ email });
    await newSubscriber.save();

    res.status(200).json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch all subscribers (for admin)
router.get("/", async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ subscribedAt: -1 }).select("email subscribedAt");
    res.status(200).json(subscribers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// SEND EMAIL TO ALL SUBSCRIBERS
router.post("/send", async (req, res) => {
  try {
    console.log("📩 Send email API HIT");

    const { subject, message } = req.body;

    // 🔹 Validate input
    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        error: "Subject and message are required",
      });
    }

    // 🔹 Get all subscribers
    const subscribers = await Newsletter.find().select("email -_id");

    if (!subscribers.length) {
      return res.status(400).json({
        success: false,
        error: "No subscribers found",
      });
    }

    const emails = subscribers.map((sub) => sub.email);

    console.log("📧 Total subscribers:", emails.length);

    // 🔥 Send emails in batches (IMPORTANT)
    const batchSize = 50;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);

      console.log(`🚀 Sending batch ${i / batchSize + 1}`);

      await sendEmail({
        to: batch, // send to batch
        subject,
        text: message,
        html: `<p>${message}</p>`,
      });
    }

    console.log("✅ All emails sent successfully");

    res.status(200).json({
      success: true,
      message: "Emails sent to all subscribers successfully",
    });

  } catch (error) {
    console.error("❌ EMAIL SEND ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
});


export default router;