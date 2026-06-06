import sendEmail from "../utils/sendEmail.js";
import express from 'express';
import Newsletter from '../models/Newsletter.js';
import connectDB from '../config/db.js'; // ✅ add this

const router = express.Router();

router.post('/', async (req, res) => {
  console.log("API HIT");
  try {
    await connectDB(); // ✅ add this

    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const existing = await Newsletter.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already subscribed' });

    const newSubscriber = new Newsletter({ email });
    await newSubscriber.save();

    res.status(200).json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message }); // ✅ show real error
  }
});

router.get("/", async (req, res) => {
  try {
    await connectDB(); // ✅ add this
    const subscribers = await Newsletter.find().sort({ subscribedAt: -1 }).select("email subscribedAt");
    res.status(200).json(subscribers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message }); // ✅ show real error
  }
});

router.post("/send", async (req, res) => {
  try {
    await connectDB(); // ✅ add this
    console.log("📩 Send email API HIT");
    // ... rest of your code unchanged
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message }); // ✅ show real error
  }
});

export default router;