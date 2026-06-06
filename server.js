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

// Connect DB on each cold start (cached via global)
connectDB();

app.use("/api", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);


// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ✅ VERCEL FIX: Export the app instead of calling app.listen()
// app.listen() does NOT work on Vercel serverless functions
export default app;
