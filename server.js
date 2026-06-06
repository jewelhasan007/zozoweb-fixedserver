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

export default app; // ✅ This is all Vercel needs