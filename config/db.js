import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is missing from environment variables");
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3000, // ✅ fail fast in 3s instead of 30s
      connectTimeoutMS: 3000,         // ✅ connection timeout
      socketTimeoutMS: 3000,          // ✅ socket timeout
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // ✅ reset so next request retries
    throw err;
  }

  return cached.conn;
};

export default connectDB;