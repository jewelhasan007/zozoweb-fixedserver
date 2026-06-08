import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  message: { type: String, required: true },
  sentTo: { type: Number, required: true },
  hasImage: { type: Boolean, default: false },
  imageUrl: { type: String, default: null }, // ✅ stores base64 image for history preview
  sentAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["success", "failed"], default: "success" },
  error: { type: String, default: null },
});

export default mongoose.models.EmailLog ||
  mongoose.model("EmailLog", emailLogSchema);