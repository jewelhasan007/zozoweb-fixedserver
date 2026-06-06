import mongoose from "mongoose";

// ✅ FIX: Use the default mongoose connection (managed by db.js)
// Do NOT use a separate newsletterConnection — it crashes on Vercel
// because the second connection fires before env vars are available.

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Newsletter ||
  mongoose.model("Newsletter", newsletterSchema);
