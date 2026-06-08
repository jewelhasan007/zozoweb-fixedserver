import sendEmail from "../utils/sendEmail.js";
import express from 'express';
import Newsletter from '../models/Newsletter.js';
import connectDB from '../config/db.js';
import protect from "../middleware/authMiddleware.js";
import EmailLog from "../models/EmailLog.js";
import { v2 as cloudinary } from "cloudinary";


const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    const { subject, message, html, imageBase64 } = req.body; // ✅ destructure imageBase64

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

    // ✅ Respond immediately — don't wait for emails to finish
    res.status(200).json({
      success: true,
      message: `Sending emails to ${emails.length} subscribers...`,
    });

    // ✅ Send emails AFTER responding (background)
    const emailPromises = emails.map((email) =>
      sendEmail({
        to: email,
        subject,
        text: message,
        html: html || `<p>${message}</p>`,
      })
        .then(() => console.log(`✅ Sent to: ${email}`))
        .catch((err) => console.error(`❌ Failed: ${email}:`, err.message))
    );

    await Promise.all(emailPromises);

    // ✅ Save log after sending — now includes imageUrl
    await EmailLog.create({
      subject,
      message,
      sentTo: emails.length,
      hasImage: !!imageBase64,
      imageUrl: imageBase64 || null, // ✅ store base64 for history thumbnail
      status: "success",
    });

    console.log("✅ All emails sent successfully");

  } catch (error) {
    console.error("❌ EMAIL SEND ERROR:", error);

    if (!res.headersSent) {
      await EmailLog.create({
        subject: req.body.subject || "Unknown",
        message: req.body.message || "Unknown",
        sentTo: 0,
        hasImage: false,
        imageUrl: null,
        status: "failed",
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
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
// ✅ NEW - Upload image, returns a hosted URL
router.post("/upload-image", protect, async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: "No image provided" });

    const result = await cloudinary.uploader.upload(imageBase64, {
      folder: "newsletter",
    });

    res.status(200).json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;