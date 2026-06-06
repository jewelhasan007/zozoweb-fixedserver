
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // ✅ ADD THIS

console.log("ENV VALUE: NEWSLETTER_DB_URI =", process.env.NEWSLETTER_DB_URI);

const uri = process.env.NEWSLETTER_DB_URI;

if (!uri) {
  throw new Error("❌ NEWSLETTER_DB_URI is undefined");
}

const newsletterConnection = mongoose.createConnection(uri);

newsletterConnection.on("connected", () => {
  console.log("✅ Newsletter DB Connected");
});

newsletterConnection.on("error", (err) => {
  console.error("❌ Newsletter DB Error:", err);
});

export default newsletterConnection;