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

export default app; // ✅ This is all Vercel needs