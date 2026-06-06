import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String },
    company: { type: String },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

// ✅ Guard against "Cannot overwrite model once compiled" on hot reload
export default mongoose.models.Contact ||
  mongoose.model("Contact", contactSchema);
