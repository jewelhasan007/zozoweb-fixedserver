import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import contactRoutes from "./routes/contactRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// ❌ DELETE these 4 lines — app.listen() crashes Vercel:
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

app.get("/debug", (req, res) => {
  res.json({
    mongo_uri_set: !!process.env.MONGO_URI,
    mongo_uri_prefix: process.env.MONGO_URI?.substring(0, 20) || "NOT SET"
  });
});

app.get("/debug-db", async (req, res) => {
  try {
    await connectDB();
    res.json({ db: "connected" });
  } catch (err) {
    res.json({ db: "failed", error: err.message });
  }
});

app.get("/debug-smtp", (req, res) => {
  res.json({
    smtp_user_set: !!process.env.SMTP_USER,
    smtp_user: process.env.SMTP_USER || "NOT SET",
    smtp_pass_set: !!process.env.SMTP_PASS,
  });
});

app.get("/debug-resend", (req, res) => {
  res.json({
    resend_key_set: !!process.env.RESEND_API_KEY,
    resend_key_prefix: process.env.RESEND_API_KEY?.substring(0, 15) || "NOT SET",
    resend_key_length: process.env.RESEND_API_KEY?.length || 0 // ✅ add this
  });
});
export default app; // ✅ This is all Vercel needs